import argparse
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_absolute_error, r2_score, roc_auc_score
from sklearn.model_selection import train_test_split


def load_experimental_data(path: Path, label: int, max_rows: int | None) -> pd.DataFrame:
    df = pd.read_csv(path)
    if max_rows and len(df) > max_rows:
        df = df.sample(max_rows, random_state=42).sort_index()

    df = df.rename(columns=str.strip)
    df = df.assign(dataset_label=label)

    if not {"Time", "Current", "Voltage", "Temperature"}.issubset(df.columns):
        raise ValueError(f"Unexpected columns in {path.name}: {df.columns.tolist()}")

    df = df.sort_values("Time")
    df["dt"] = df["Time"].diff().fillna(0)
    df["dVdt"] = df["Voltage"].diff().fillna(0) / df["dt"].replace(0, np.nan)
    df["dIdt"] = df["Current"].diff().fillna(0) / df["dt"].replace(0, np.nan)
    df["dVdt"] = df["dVdt"].fillna(0)
    df["dIdt"] = df["dIdt"].fillna(0)

    window = 20
    df["Current_roll"] = df["Current"].rolling(window, min_periods=1).mean()
    df["Voltage_roll"] = df["Voltage"].rolling(window, min_periods=1).mean()
    df["Temp_roll"] = df["Temperature"].rolling(window, min_periods=1).mean()

    return df


def compute_soc_coulomb(df: pd.DataFrame, capacity_ah: float, initial_soc: float, discharge_sign: int) -> pd.Series:
    capacity_c = capacity_ah * 3600.0
    current = df["Current"].to_numpy()
    dt = df["dt"].to_numpy()
    signed_current = discharge_sign * current
    delta_soc = np.cumsum(signed_current * dt) / capacity_c
    soc = np.clip(initial_soc - delta_soc, 0.0, 1.0)
    return pd.Series(soc, index=df.index)


def compute_soc_from_ocv(df: pd.DataFrame, ocv_curve: pd.DataFrame) -> pd.Series:
    curve = ocv_curve.rename(columns=str.strip).sort_values("V0")
    soc_values = curve["SOC"].to_numpy()
    v_values = curve["V0"].to_numpy()
    soc = np.interp(df["Voltage"].to_numpy(), v_values, soc_values)
    return pd.Series(np.clip(soc, 0.0, 1.0), index=df.index)


def train_voltage_regression(df: pd.DataFrame) -> dict:
    features = df[["Time", "Current", "Temperature", "dIdt", "Current_roll", "Temp_roll"]]
    target = df["Voltage"]
    x_train, x_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(x_train, y_train)
    preds = model.predict(x_test)

    return {
        "mae": mean_absolute_error(y_test, preds),
        "r2": r2_score(y_test, preds)
    }


def train_soc_regression(df: pd.DataFrame) -> dict:
    features = df[["Voltage", "Current", "Temperature", "dVdt", "Current_roll", "Voltage_roll"]]
    target = df["soc_ocv"]
    x_train, x_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(x_train, y_train)
    preds = model.predict(x_test)

    return {
        "mae": mean_absolute_error(y_test, preds),
        "r2": r2_score(y_test, preds)
    }


def train_fresh_aged_classifier(df: pd.DataFrame) -> dict:
    features = df[[
        "Voltage",
        "Current",
        "Temperature",
        "dVdt",
        "dIdt",
        "Voltage_roll",
        "Current_roll",
        "Temp_roll"
    ]]
    target = df["dataset_label"]
    x_train, x_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42, stratify=target)

    model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
    model.fit(x_train, y_train)
    preds = model.predict(x_test)
    probas = model.predict_proba(x_test)[:, 1]

    return {
        "accuracy": accuracy_score(y_test, preds),
        "roc_auc": roc_auc_score(y_test, probas)
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Train simple battery models.")
    parser.add_argument("--data-dir", type=Path, default=Path(__file__).parent / "battery_data_set")
    parser.add_argument("--capacity-ah", type=float, default=2.3)
    parser.add_argument("--initial-soc", type=float, default=1.0)
    parser.add_argument("--discharge-sign", type=int, default=1, choices=[-1, 1])
    parser.add_argument("--max-rows", type=int, default=120000)
    args = parser.parse_args()

    fresh_path = args.data_dir / "Experimental_data_fresh_cell.csv"
    aged_path = args.data_dir / "Experimental_data_aged_cell.csv"
    ocv_path = args.data_dir / "OCV_vs_SOC_curve.csv"

    fresh_df = load_experimental_data(fresh_path, label=0, max_rows=args.max_rows)
    aged_df = load_experimental_data(aged_path, label=1, max_rows=args.max_rows)
    ocv_curve = pd.read_csv(ocv_path)

    fresh_df["soc_coulomb"] = compute_soc_coulomb(fresh_df, args.capacity_ah, args.initial_soc, args.discharge_sign)
    aged_df["soc_coulomb"] = compute_soc_coulomb(aged_df, args.capacity_ah, args.initial_soc, args.discharge_sign)

    fresh_df["soc_ocv"] = compute_soc_from_ocv(fresh_df, ocv_curve)
    aged_df["soc_ocv"] = compute_soc_from_ocv(aged_df, ocv_curve)

    all_df = pd.concat([fresh_df, aged_df], ignore_index=True)

    voltage_metrics = train_voltage_regression(all_df)
    soc_metrics = train_soc_regression(all_df)
    class_metrics = train_fresh_aged_classifier(all_df)

    print("Voltage regression:")
    print(f"  MAE: {voltage_metrics['mae']:.6f}")
    print(f"  R2:  {voltage_metrics['r2']:.4f}")
    print("\nSOC regression (OCV-derived target):")
    print(f"  MAE: {soc_metrics['mae']:.6f}")
    print(f"  R2:  {soc_metrics['r2']:.4f}")
    print("\nFresh vs aged classification:")
    print(f"  Accuracy: {class_metrics['accuracy']:.4f}")
    print(f"  ROC AUC:  {class_metrics['roc_auc']:.4f}")


if __name__ == "__main__":
    main()
