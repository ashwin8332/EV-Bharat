"""Shared drowsiness analysis utilities.

Goal: provide a more stable/accurate drowsiness signal than a simple frame counter.

This module keeps *state* across frames (calibration, smoothing, PERCLOS window,
prolonged eye-closure, yawn duration).

It intentionally avoids claiming psychological traits ("sensitive", "emotional").
Instead it outputs measurable signals: eye closure, PERCLOS, mouth openness.
"""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
import time
from typing import Deque, Optional, Tuple

import numpy as np


# -----------------------------
# Geometry helpers
# -----------------------------

def _dist(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.linalg.norm(a - b))


def eye_aspect_ratio_6pts(eye6: np.ndarray) -> float:
    """Standard 6-point EAR.

    eye6 order: [p1, p2, p3, p4, p5, p6]
      p1-p4 are horizontal corners
      p2/p3 are upper lid points
      p6/p5 are lower lid points
    """
    if eye6.shape[0] < 6:
        return 1.0
    a = _dist(eye6[1], eye6[5])
    b = _dist(eye6[2], eye6[4])
    c = _dist(eye6[0], eye6[3])
    if c <= 1e-6:
        return 1.0
    return (a + b) / (2.0 * c)


def mouth_aspect_ratio_simple(mouth: np.ndarray) -> float:
    """Simple mouth opening ratio.

    Expects 4 points: left_corner, right_corner, upper_lip, lower_lip.
    Returns (vertical opening) / (mouth width).
    """
    if mouth.shape[0] < 4:
        return 0.0
    width = _dist(mouth[0], mouth[1])
    if width <= 1e-6:
        return 0.0
    opening = _dist(mouth[2], mouth[3])
    return opening / width


# -----------------------------
# Analyzer
# -----------------------------


@dataclass
class AnalyzerConfig:
    # Initial (fallback) thresholds. These are refined via calibration.
    ear_threshold: float = 0.25
    mar_threshold: float = 0.35

    # Calibration
    calibration_seconds: float = 2.0

    # Smoothing
    ema_alpha: float = 0.35

    # PERCLOS (percentage of time eyes are closed)
    perclos_window_seconds: float = 10.0
    perclos_drowsy_threshold: float = 0.40

    # Prolonged eye closure
    prolonged_eye_closed_seconds: float = 1.5

    # Yawn detection
    yawn_min_seconds: float = 1.0
    yawns_in_window_threshold: int = 2
    yawn_window_seconds: float = 20.0


@dataclass
class AnalyzerOutput:
    face_present: bool
    ear: float
    mar: float
    ear_threshold: float
    mar_threshold: float
    eye_closed: bool
    prolonged_eye_closed: bool
    perclos: float
    yawn_active: bool
    yawn_event: bool
    drowsy: bool
    risk: float  # 0..1


class DrowsinessAnalyzer:
    """Stateful analyzer for drowsiness signals."""

    def __init__(self, config: Optional[AnalyzerConfig] = None):
        self.config = config or AnalyzerConfig()

        self._started_at = time.time()
        self._calibration_ears: list[float] = []
        self._calibration_mars: list[float] = []
        self._calibrated = False

        self._ear_ema: Optional[float] = None
        self._mar_ema: Optional[float] = None

        self._ear_threshold = float(self.config.ear_threshold)
        self._mar_threshold = float(self.config.mar_threshold)

        self._closed_history: Deque[Tuple[float, bool]] = deque()
        self._eye_closed_since: Optional[float] = None

        self._yawn_since: Optional[float] = None
        self._yawn_events: Deque[float] = deque()

    @property
    def calibrated(self) -> bool:
        return self._calibrated

    def _maybe_calibrate(self, now: float) -> None:
        if self._calibrated:
            return
        if now - self._started_at < self.config.calibration_seconds:
            return

        if self._calibration_ears:
            baseline_ear = float(np.median(self._calibration_ears))
            # Set threshold relative to user's open-eye baseline.
            # Keep in a sensible range so it doesn't become unusable.
            self._ear_threshold = float(np.clip(baseline_ear * 0.70, 0.18, 0.30))

        if self._calibration_mars:
            baseline_mar = float(np.median(self._calibration_mars))
            # Allow a bit above baseline; clamp so it's not too sensitive.
            self._mar_threshold = float(np.clip(baseline_mar + 0.15, 0.25, 0.60))

        self._calibrated = True

    def update(self, *, now: Optional[float] = None, ear: Optional[float] = None, mar: Optional[float] = None, face_present: bool) -> AnalyzerOutput:
        now = float(now if now is not None else time.time())

        if not face_present or ear is None or mar is None:
            # Decay histories but do not invent signals.
            self._closed_history.append((now, False))
            self._prune_histories(now)
            return AnalyzerOutput(
                face_present=False,
                ear=0.0,
                mar=0.0,
                ear_threshold=self._ear_threshold,
                mar_threshold=self._mar_threshold,
                eye_closed=False,
                prolonged_eye_closed=False,
                perclos=self._compute_perclos(),
                yawn_active=False,
                yawn_event=False,
                drowsy=False,
                risk=0.0,
            )

        # Smoothing
        self._ear_ema = ear if self._ear_ema is None else (self.config.ema_alpha * ear + (1.0 - self.config.ema_alpha) * self._ear_ema)
        self._mar_ema = mar if self._mar_ema is None else (self.config.ema_alpha * mar + (1.0 - self.config.ema_alpha) * self._mar_ema)

        ear_s = float(self._ear_ema)
        mar_s = float(self._mar_ema)

        # Calibration sampling (only while not calibrated)
        if not self._calibrated:
            self._calibration_ears.append(float(ear_s))
            self._calibration_mars.append(float(mar_s))
            self._maybe_calibrate(now)

        eye_closed = ear_s < self._ear_threshold
        self._closed_history.append((now, eye_closed))

        prolonged = False
        if eye_closed:
            if self._eye_closed_since is None:
                self._eye_closed_since = now
            prolonged = (now - self._eye_closed_since) >= self.config.prolonged_eye_closed_seconds
        else:
            self._eye_closed_since = None

        # Yawn detection by duration above threshold
        yawn_active = mar_s > self._mar_threshold
        yawn_event = False
        if yawn_active:
            if self._yawn_since is None:
                self._yawn_since = now
        else:
            if self._yawn_since is not None:
                if (now - self._yawn_since) >= self.config.yawn_min_seconds:
                    yawn_event = True
                    self._yawn_events.append(now)
            self._yawn_since = None

        self._prune_histories(now)

        perclos = self._compute_perclos()
        yawns_recent = self._count_recent_yawns(now)

        drowsy = bool(
            prolonged
            or (perclos >= self.config.perclos_drowsy_threshold)
            or (yawns_recent >= self.config.yawns_in_window_threshold)
        )

        # Risk score 0..1: combine signals conservatively.
        risk = 0.0
        risk = max(risk, min(1.0, perclos / max(1e-6, self.config.perclos_drowsy_threshold)))
        if prolonged:
            risk = max(risk, 1.0)
        if yawns_recent:
            risk = max(risk, min(1.0, 0.4 + 0.3 * yawns_recent))

        return AnalyzerOutput(
            face_present=True,
            ear=ear_s,
            mar=mar_s,
            ear_threshold=self._ear_threshold,
            mar_threshold=self._mar_threshold,
            eye_closed=eye_closed,
            prolonged_eye_closed=prolonged,
            perclos=perclos,
            yawn_active=yawn_active,
            yawn_event=yawn_event,
            drowsy=drowsy,
            risk=float(np.clip(risk, 0.0, 1.0)),
        )

    def _prune_histories(self, now: float) -> None:
        # closed history -> perclos window
        window_start = now - self.config.perclos_window_seconds
        while self._closed_history and self._closed_history[0][0] < window_start:
            self._closed_history.popleft()

        # yawn events window
        yawn_start = now - self.config.yawn_window_seconds
        while self._yawn_events and self._yawn_events[0] < yawn_start:
            self._yawn_events.popleft()

    def _compute_perclos(self) -> float:
        if not self._closed_history:
            return 0.0
        closed = sum(1 for _, is_closed in self._closed_history if is_closed)
        return float(closed / len(self._closed_history))

    def _count_recent_yawns(self, now: float) -> int:
        _ = now
        return int(len(self._yawn_events))
