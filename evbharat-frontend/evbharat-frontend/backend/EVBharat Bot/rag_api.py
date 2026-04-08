"""
EVBharat EV Compliance & Advisory API
--------------------------------------
FastAPI backend that provides:
  1. Free-form chat about Indian EV rules, laws, subsidies & compliance.
  2. PDF upload + RAG-based Q&A over uploaded documents.

All heavy ML/LLM imports are lazy-loaded so the server starts instantly even
when some optional packages (unstructured, torch ...) are missing.
"""

from __future__ import annotations

from fastapi import FastAPI, File, UploadFile, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
import os, hashlib, shutil, uuid, time, logging, json, importlib
from collections import OrderedDict
from io import BytesIO
from pathlib import Path
from typing import Dict, Any, List, Optional

# ── env ──────────────────────────────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv()

# ── logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── app ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="EVBharat Compliance & Advisory API",
    version="2.0.0",
    description="Indian EV compliance checker, policy advisor & document analyser.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True)
FAISS_INDEX_DIR = DATA_DIR / "faiss_indexes"
FAISS_INDEX_DIR.mkdir(parents=True, exist_ok=True)

# ── in-memory session store ──────────────────────────────────────────────────
active_sessions: Dict[str, Any] = {}

# ── lazy helpers ─────────────────────────────────────────────────────────────
_llm_instance = None
_vision_llm_instance = None
_whisper_model = None
_embeddings_instance = None
_embeddings_model_name = None
_local_hash_embeddings_instance = None
_tts_cache: "OrderedDict[str, bytes]" = OrderedDict()

TTS_VOICE_BY_LANGUAGE = {
    "en": "en-IN-NeerjaNeural",
    "hi": "hi-IN-SwaraNeural",
    "kn": "kn-IN-SapnaNeural",
    "ta": "ta-IN-PallaviNeural",
    "te": "te-IN-ShrutiNeural",
    "mr": "mr-IN-AarohiNeural",
}


def _safe_unlink(path: Path):
    try:
        path.unlink(missing_ok=True)
    except TypeError:
        # Python versions without missing_ok support
        if path.exists():
            path.unlink()
    except Exception as exc:
        logger.warning("⚠️ Failed to cleanup file %s: %s", path, exc)


def _safe_rmtree(path: Path):
    try:
        if path.exists():
            shutil.rmtree(path)
    except Exception as exc:
        logger.warning("⚠️ Failed to cleanup directory %s: %s", path, exc)


def _get_llm():
    """Return a cached ChatGoogleGenerativeAI instance (lazy-loaded)."""
    global _llm_instance
    if _llm_instance is None:
        try:
            # Get API key from environment
            api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
            
            if not api_key:
                logger.error("❌ No GEMINI_API_KEY or GOOGLE_API_KEY found in environment variables!")
                raise ValueError("GEMINI_API_KEY environment variable not set")
            
            # Set the environment variable for Google Auth
            os.environ['GOOGLE_API_KEY'] = api_key
            
            from langchain_google_genai import ChatGoogleGenerativeAI
            _llm_instance = ChatGoogleGenerativeAI(
                temperature=0.6,
                model="gemini-2.5-flash",
                google_api_key=api_key
            )
            logger.info("✅ LLM initialised (gemini-2.5-flash) with Google API key")
        except Exception as e:
            logger.error(f"❌ Failed to initialize LLM: {str(e)}")
            raise
    return _llm_instance


def _get_embeddings():
    """Return a cached embeddings model for FAISS indexing."""
    global _embeddings_instance, _embeddings_model_name
    if _embeddings_instance is None:
        allow_local_fallback = os.getenv("RAG_EMBEDDING_ALLOW_LOCAL_FALLBACK", "true").strip().lower() in {
            "1",
            "true",
            "yes",
            "on",
        }

        provider = os.getenv("RAG_EMBEDDING_PROVIDER", "google").strip().lower()
        if provider in {"local", "local-hash", "hash"}:
            _embeddings_instance = _get_local_hash_embeddings()
            _embeddings_model_name = "local-hash"
            logger.info("✅ Embeddings initialised (local-hash)")
            return _embeddings_instance

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            if allow_local_fallback:
                logger.warning(
                    "⚠️ No GEMINI_API_KEY/GOOGLE_API_KEY found; using local-hash embeddings fallback."
                )
                _embeddings_instance = _get_local_hash_embeddings()
                _embeddings_model_name = "local-hash-no-key"
                return _embeddings_instance

            logger.error("❌ No GEMINI_API_KEY or GOOGLE_API_KEY found in environment variables!")
            raise ValueError("GEMINI_API_KEY environment variable not set")

        os.environ["GOOGLE_API_KEY"] = api_key
        preferred_model = os.getenv("RAG_EMBEDDING_MODEL", "").strip()
        env_models_raw = os.getenv("RAG_EMBEDDING_MODELS", "").strip()

        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings

            # Try a compatibility set because available model IDs vary by API version/key.
            candidate_models: List[str] = []
            if preferred_model:
                candidate_models.append(preferred_model)

            if env_models_raw:
                candidate_models.extend([m.strip() for m in env_models_raw.split(",") if m.strip()])

            candidate_models.extend([
                "models/gemini-embedding-001",
                "gemini-embedding-001",
                "models/text-embedding-004",
                "text-embedding-004",
                "models/embedding-001",
                "embedding-001",
            ])

            expanded_candidates: List[str] = []
            for model_name in candidate_models:
                expanded_candidates.append(model_name)
                if model_name.startswith("models/"):
                    expanded_candidates.append(model_name[len("models/"):])
                else:
                    expanded_candidates.append(f"models/{model_name}")

            unique_candidates: List[str] = []
            seen = set()
            for model_name in expanded_candidates:
                if model_name and model_name not in seen:
                    seen.add(model_name)
                    unique_candidates.append(model_name)

            attempts: List[str] = []
            for model_name in unique_candidates:
                try:
                    candidate = GoogleGenerativeAIEmbeddings(
                        model=model_name,
                        google_api_key=api_key,
                    )
                    # Probe once so unsupported model IDs fail early with a clear fallback.
                    candidate.embed_query("EV Bharat embedding health check")
                    _embeddings_instance = candidate
                    _embeddings_model_name = model_name
                    logger.info("✅ Embeddings initialised (%s)", model_name)
                    break
                except Exception as probe_exc:
                    attempts.append(f"{model_name}: {probe_exc}")
                    logger.warning("⚠️ Embedding model unavailable (%s): %s", model_name, probe_exc)

            if _embeddings_instance is None:
                summary = " | ".join(attempts[:4])
                if allow_local_fallback:
                    logger.warning(
                        "⚠️ No supported Google embedding model available; using local-hash fallback. "
                        "Tried %s models. Sample errors: %s",
                        len(unique_candidates),
                        summary,
                    )
                    _embeddings_instance = _get_local_hash_embeddings()
                    _embeddings_model_name = "local-hash-auto"
                else:
                    raise RuntimeError(
                        "No supported Google embedding model available for this API key/version. "
                        f"Tried {len(unique_candidates)} models. Sample errors: {summary}"
                    )
        except Exception as exc:
            if allow_local_fallback:
                logger.warning(
                    "⚠️ Failed to initialize Google embeddings (%s); using local-hash fallback.",
                    exc,
                )
                _embeddings_instance = _get_local_hash_embeddings()
                _embeddings_model_name = "local-hash-auto"
            else:
                logger.error("❌ Failed to initialize embeddings: %s", exc)
                raise

    return _embeddings_instance


def _get_local_hash_embeddings():
    """Return a cached local embedding implementation with no external API dependency."""
    global _local_hash_embeddings_instance
    if _local_hash_embeddings_instance is None:
        try:
            from sklearn.feature_extraction.text import HashingVectorizer
            import numpy as np
            from langchain_core.embeddings import Embeddings
        except Exception as exc:
            raise RuntimeError(
                "Local hash embeddings require scikit-learn and numpy."
            ) from exc

        class LocalHashEmbeddings(Embeddings):
            def __init__(self, n_features: int):
                self.vectorizer = HashingVectorizer(
                    n_features=n_features,
                    alternate_sign=False,
                    norm="l2",
                )

            def embed_documents(self, texts: List[str]) -> List[List[float]]:
                if not texts:
                    return []
                matrix = self.vectorizer.transform([t or "" for t in texts])
                return np.asarray(matrix.toarray(), dtype="float32").tolist()

            def embed_query(self, text: str) -> List[float]:
                matrix = self.vectorizer.transform([text or ""])
                return np.asarray(matrix.toarray()[0], dtype="float32").tolist()

        n_features = max(128, int(os.getenv("LOCAL_HASH_EMBED_DIM", "768")))
        _local_hash_embeddings_instance = LocalHashEmbeddings(n_features=n_features)

    return _local_hash_embeddings_instance


def _is_embedding_quota_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    checks = [
        "resourceexhausted",
        "429",
        "quota",
        "rate limit",
        "rate-limits",
        "batch_embed_contents",
    ]
    return any(token in msg for token in checks)


def _is_llm_access_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    checks = [
        "permissiondenied",
        "403",
        "denied access",
        "forbidden",
        "contact support",
    ]
    return any(token in msg for token in checks)


def _fallback_advisory_response(question: str, docs: Optional[List[str]] = None) -> str:
    """Return a deterministic fallback answer when remote LLM access is unavailable."""
    question_clean = (question or "").strip()
    lines: List[str] = [
        "Model provider access is temporarily unavailable for this project (HTTP 403).",
        "",
        "Fallback mode is active. You can still continue with structured guidance.",
    ]

    if docs:
        excerpts = [d.strip() for d in docs if d and d.strip()]
        if excerpts:
            lines.extend([
                "",
                "Top relevant extracted context:",
            ])
            for i, text in enumerate(excerpts[:3], start=1):
                snippet = text[:450].replace("\n", " ").strip()
                lines.append(f"{i}. {snippet}{'...' if len(text) > 450 else ''}")

    lines.extend([
        "",
        "Suggested next step format:",
        "1. Objective: what you want to verify.",
        "2. Applicable scheme/standard: FAME/PM E-DRIVE, AIS-156, state EV policy, etc.",
        "3. Required documents/checklist.",
        "4. Authority to confirm: OEM, state transport portal, MHI, BIS notification.",
    ])

    if question_clean:
        lines.extend([
            "",
            "Your question captured:",
            question_clean,
        ])

    lines.extend([
        "",
        "To restore full AI answers, use a Gemini project/key with chat model access or switch provider configuration.",
    ])

    return "\n".join(lines)


def _get_vision_llm():
    """Return a cached ChatGoogleGenerativeAI instance optimized for vision (lazy-loaded)."""
    global _vision_llm_instance
    if _vision_llm_instance is None:
        try:
            # Get API key from environment
            api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
            
            if not api_key:
                logger.error("❌ No GEMINI_API_KEY or GOOGLE_API_KEY found in environment variables!")
                raise ValueError("GEMINI_API_KEY environment variable not set")
            
            # Set the environment variable for Google Auth
            os.environ['GOOGLE_API_KEY'] = api_key
            
            from langchain_google_genai import ChatGoogleGenerativeAI
            _vision_llm_instance = ChatGoogleGenerativeAI(
                temperature=0.6,
                model="gemini-2.5-flash-image",
                google_api_key=api_key
            )
            logger.info("✅ Vision LLM initialised (gemini-2.5-flash-image) with Google API key")
        except Exception as e:
            logger.error(f"⚠️  Failed to initialize Vision LLM, falling back to regular LLM: {str(e)}")
            # Fallback to regular LLM if vision LLM fails
            return _get_llm()
    return _vision_llm_instance


def _get_whisper_model():
    """Return a cached faster-whisper model instance (lazy-loaded)."""
    global _whisper_model
    if _whisper_model is None:
        model_name = os.getenv("WHISPER_MODEL", "base")
        device = os.getenv("WHISPER_DEVICE", "cpu")
        compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
        try:
            from faster_whisper import WhisperModel

            _whisper_model = WhisperModel(
                model_name,
                device=device,
                compute_type=compute_type,
            )
            logger.info(
                "✅ Whisper model initialised (%s, device=%s, compute_type=%s)",
                model_name,
                device,
                compute_type,
            )
        except ImportError as exc:
            raise RuntimeError(
                "faster-whisper is not installed. Install it with `pip install faster-whisper`."
            ) from exc
        except Exception as exc:
            logger.error("❌ Failed to initialize Whisper model: %s", exc)
            raise RuntimeError(f"Failed to initialize Whisper model: {exc}") from exc
    return _whisper_model


def _normalise_tts_text(text: str) -> str:
    """Collapse noisy whitespace so synthesis is faster and predictable."""
    cleaned = " ".join(text.strip().split())
    if not cleaned:
        raise ValueError("Text is empty after normalization")
    return cleaned


def _truncate_tts_text(text: str, max_chars: int) -> tuple[str, bool]:
    if len(text) <= max_chars:
        return text, False

    cut_at = text.rfind(" ", 0, max_chars)
    if cut_at < max_chars // 2:
        cut_at = max_chars
    return text[:cut_at].rstrip() + "...", True


def _tts_cache_get(cache_key: str) -> Optional[bytes]:
    hit = _tts_cache.get(cache_key)
    if hit is None:
        return None
    _tts_cache.move_to_end(cache_key)
    return hit


def _tts_cache_put(cache_key: str, audio_bytes: bytes):
    cache_max_items = max(1, int(os.getenv("TTS_CACHE_MAX_ITEMS", "64")))
    _tts_cache[cache_key] = audio_bytes
    _tts_cache.move_to_end(cache_key)
    while len(_tts_cache) > cache_max_items:
        _tts_cache.popitem(last=False)


def _tts_cache_key(text: str, language: str, slow: bool) -> str:
    raw = f"{language}|{int(slow)}|{text}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


async def _synth_edge_tts(text: str, language: str, slow: bool) -> bytes:
    edge_tts = importlib.import_module("edge_tts")

    voice = TTS_VOICE_BY_LANGUAGE.get(language, TTS_VOICE_BY_LANGUAGE["en"])
    rate = "-22%" if slow else "+0%"
    comm = edge_tts.Communicate(text=text, voice=voice, rate=rate)

    chunks: List[bytes] = []
    async for chunk in comm.stream():
        if chunk.get("type") == "audio":
            chunks.append(chunk["data"])

    audio_bytes = b"".join(chunks)
    if not audio_bytes:
        raise RuntimeError("edge-tts returned empty audio")
    return audio_bytes


async def _synth_gtts(text: str, language: str, slow: bool) -> bytes:
    from gtts import gTTS

    def _build_audio() -> bytes:
        fp = BytesIO()
        gTTS(text=text, lang=language, slow=slow).write_to_fp(fp)
        return fp.getvalue()

    audio_bytes = await run_in_threadpool(_build_audio)
    if not audio_bytes:
        raise RuntimeError("gTTS returned empty audio")
    return audio_bytes


async def _synth_tts_audio(text: str, language: str, slow: bool) -> tuple[bytes, str]:
    provider = os.getenv("TTS_PROVIDER", "auto").strip().lower()

    if provider == "gtts":
        return await _synth_gtts(text=text, language=language, slow=slow), "gtts"

    try:
        return await _synth_edge_tts(text=text, language=language, slow=slow), "edge"
    except Exception as edge_exc:
        logger.warning("⚠️ edge-tts failed; falling back to gTTS: %s", edge_exc)
        return await _synth_gtts(text=text, language=language, slow=slow), "gtts"


def _extract_pdf_text_pdfminer(file_path: str) -> str:
    """Try extracting text with pdfminer."""
    from pdfminer.high_level import extract_text

    return (extract_text(file_path) or "").strip()


def _extract_pdf_text_pypdf(file_path: str) -> str:
    """Fallback extraction with pypdf for PDFs where pdfminer fails."""
    from pypdf import PdfReader

    reader = PdfReader(file_path)
    extracted: List[str] = []
    for page in reader.pages:
        text = (page.extract_text() or "").strip()
        if text:
            extracted.append(text)
    return "\n\n".join(extracted).strip()


def _extract_pdf_text_ocr(file_path: str) -> str:
    """Last-resort OCR for scanned PDFs.

    This may require system tools (poppler + tesseract). If unavailable, it
    returns an empty string and lets the caller decide how to proceed.
    """
    max_pages = int(os.getenv("PDF_OCR_MAX_PAGES", "20"))
    dpi = int(os.getenv("PDF_OCR_DPI", "200"))

    try:
        from pdf2image import convert_from_path
        import pytesseract
    except Exception as exc:
        logger.warning("⚠️ OCR dependencies unavailable: %s", exc)
        return ""

    try:
        pages = convert_from_path(file_path, dpi=dpi, first_page=1, last_page=max_pages)
    except Exception as exc:
        logger.warning("⚠️ OCR page conversion failed: %s", exc)
        return ""

    extracted: List[str] = []
    for idx, page in enumerate(pages, start=1):
        try:
            text = (pytesseract.image_to_string(page) or "").strip()
            if text:
                extracted.append(text)
        except Exception as exc:
            logger.warning("⚠️ OCR failed on page %s: %s", idx, exc)

    return "\n\n".join(extracted).strip()


# ── Indian EV system prompt ─────────────────────────────────────────────────
EV_SYSTEM_PROMPT = """You are **EVBharat AI** - an expert advisor on India's Electric Vehicle ecosystem.

Your knowledge covers (but is not limited to):
- **FAME I & FAME II** subsidy schemes by the Ministry of Heavy Industries
- **PM E-DRIVE Scheme** (successor of FAME)
- **PLI (Production Linked Incentive)** scheme for Advanced Chemistry Cell batteries
- **National Electric Mobility Mission Plan (NEMMP) 2020**
- **State-level EV policies** - Maharashtra, Gujarat, Karnataka, Tamil Nadu, Delhi, Telangana, Kerala, Uttar Pradesh, etc.
- **GST rules** - 5% GST on EVs vs 28%+ cess on ICE vehicles
- **Income-tax benefits** - Section 80EEB deduction on interest paid on EV loans
- **Motor Vehicle Act** amendments for EVs, registration & road-tax exemptions
- **BIS standards** - AIS 156/AIS 038 Rev 2 for EV safety, battery, charging infra
- **CEA / BEE** guidelines for EV charging infrastructure
- **Type-approval norms** for e-2W, e-3W, e-4W, e-buses, e-cargo
- **Battery swapping policy** by NITI Aayog
- **Green license-plate** (BH series) rules
- **Scrappage / Vehicle Scrapping Policy** and its relation to EV adoption
- **Environmental & emission norms** - BS-VI, CAFE regulations
- Import-duty structure on EV components (cells, motors, chargers)
- Charging-station installation regulations and DISCOM approvals
- EV insurance requirements & IRDAI guidelines
- Latest amendments, draft rules and notifications until your knowledge cut-off

**Response guidelines:**
1. Always cite the specific scheme / section / notification when applicable.
2. Clearly state when something is a *draft* vs *notified* rule.
3. If the user asks about a state, give that state's specific policy.
4. For compliance questions, present a clear checklist.
5. If you are unsure or the answer may have changed after your training data, say so.
6. Keep answers structured with headings, bullet points and numbered lists where it helps.
7. Be factual, concise and helpful. Do NOT hallucinate rules.
"""


# ── Pydantic models ───────────────────────────────────────────────────────
class FreeChatRequest(BaseModel):
    message: str


class FreeChatResponse(BaseModel):
    response: str
    processing_time: float


class ChatRequest(BaseModel):
    message: str
    session_id: str


class ChatResponse(BaseModel):
    response: str
    session_id: str
    processing_time: float


class UploadResponse(BaseModel):
    success: bool
    message: str
    session_id: str
    file_hash: str
    document_count: int


class SpeechToTextResponse(BaseModel):
    text: str
    language: str
    processing_time: float
    model: str


class TextToSpeechRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4000)
    language: str = Field(default="en", min_length=2, max_length=10)
    slow: bool = False


# ── FAISS retriever ─────────────────────────────────────────────────────────
class SessionFaissRetriever:
    def __init__(self, session_id: str, vectorstore: Any, documents: List[str], index_dir: Path):
        self.session_id = session_id
        self.vectorstore = vectorstore
        self.documents = documents
        self.index_dir = index_dir

    @classmethod
    def build(cls, session_id: str, docs: List[str]) -> "SessionFaissRetriever":
        if not docs:
            raise ValueError("Cannot create FAISS retriever with empty documents")

        try:
            vectorstores_module = importlib.import_module("langchain_community.vectorstores")
            FAISS = getattr(vectorstores_module, "FAISS")
            documents_module = importlib.import_module("langchain_core.documents")
            Document = getattr(documents_module, "Document")
        except Exception as exc:
            raise RuntimeError(
                "FAISS dependencies are missing. Install `faiss-cpu` and langchain-community."
            ) from exc

        embeddings = _get_embeddings()
        embedding_model_used = _embeddings_model_name or os.getenv("RAG_EMBEDDING_MODEL", "auto")
        langchain_docs = [
            Document(page_content=text, metadata={"session_id": session_id, "chunk_id": i})
            for i, text in enumerate(docs)
        ]
        try:
            vectorstore = FAISS.from_documents(langchain_docs, embeddings)
        except Exception as exc:
            if _is_embedding_quota_error(exc):
                logger.warning(
                    "⚠️ Embedding quota/rate limit reached (%s); falling back to local-hash embeddings.",
                    exc,
                )
                embeddings = _get_local_hash_embeddings()
                embedding_model_used = "local-hash-fallback"
                vectorstore = FAISS.from_documents(langchain_docs, embeddings)
            else:
                raise RuntimeError(f"Embedding generation failed: {exc}") from exc

        index_dir = FAISS_INDEX_DIR / session_id
        _safe_rmtree(index_dir)
        index_dir.mkdir(parents=True, exist_ok=True)
        vectorstore.save_local(str(index_dir))

        metadata = {
            "session_id": session_id,
            "chunk_count": len(docs),
            "created_at": time.time(),
            "backend": "faiss",
            "embedding_model": embedding_model_used,
        }
        (index_dir / "meta.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")

        return cls(
            session_id=session_id,
            vectorstore=vectorstore,
            documents=docs,
            index_dir=index_dir,
        )

    @classmethod
    def load(cls, session_id: str) -> "SessionFaissRetriever":
        index_dir = FAISS_INDEX_DIR / session_id
        if not index_dir.exists():
            raise FileNotFoundError(f"FAISS index not found for session: {session_id}")

        try:
            vectorstores_module = importlib.import_module("langchain_community.vectorstores")
            FAISS = getattr(vectorstores_module, "FAISS")
        except Exception as exc:
            raise RuntimeError(
                "FAISS dependencies are missing. Install `faiss-cpu` and langchain-community."
            ) from exc

        metadata: Dict[str, Any] = {}
        meta_path = index_dir / "meta.json"
        if meta_path.exists():
            try:
                metadata = json.loads(meta_path.read_text(encoding="utf-8"))
            except Exception as exc:
                logger.warning("⚠️ Failed to parse index metadata %s: %s", meta_path, exc)

        embedding_candidates: List[Any] = []
        hint = str(metadata.get("embedding_model", "")).lower()
        if "local-hash" in hint:
            embedding_candidates.append(_get_local_hash_embeddings())

        try:
            embedding_candidates.append(_get_embeddings())
        except Exception as exc:
            logger.warning("⚠️ Google embeddings unavailable while loading session %s: %s", session_id, exc)

        embedding_candidates.append(_get_local_hash_embeddings())

        unique_embeddings: List[Any] = []
        seen_ids = set()
        for emb in embedding_candidates:
            emb_id = id(emb)
            if emb_id not in seen_ids:
                seen_ids.add(emb_id)
                unique_embeddings.append(emb)

        vectorstore = None
        last_error: Optional[Exception] = None
        for emb in unique_embeddings:
            try:
                vectorstore = FAISS.load_local(
                    str(index_dir),
                    emb,
                    allow_dangerous_deserialization=True,
                )
                break
            except Exception as exc:
                last_error = exc

        if vectorstore is None:
            raise RuntimeError(f"Failed to load FAISS index for session {session_id}: {last_error}")

        documents: List[str] = []
        mapping = getattr(vectorstore, "index_to_docstore_id", {}) or {}
        docstore = getattr(vectorstore, "docstore", None)
        if mapping and docstore:
            for idx in sorted(mapping):
                doc_id = mapping[idx]
                try:
                    doc = docstore.search(doc_id) if hasattr(docstore, "search") else None
                except Exception:
                    doc = None
                if doc is not None and hasattr(doc, "page_content"):
                    documents.append(doc.page_content)

        return cls(
            session_id=session_id,
            vectorstore=vectorstore,
            documents=documents,
            index_dir=index_dir,
        )

    def invoke(self, query: str, k: int = 5) -> List[str]:
        if not self.documents:
            return []

        limit = max(1, min(k, len(self.documents)))
        if not query or not query.strip():
            return self.documents[:limit]

        try:
            hits = self.vectorstore.similarity_search(query, k=limit)
            if hits:
                return [hit.page_content for hit in hits]
        except Exception as exc:
            logger.warning("⚠️ FAISS retrieval failed, using fallback chunks: %s", exc)

        return self.documents[:limit]


def _find_uploaded_file_for_session(session_id: str) -> Optional[Path]:
    candidates = sorted(DATA_DIR.glob(f"{session_id}_*"))
    for path in candidates:
        if path.is_file():
            return path
    return None


def _restore_session(session_id: str) -> bool:
    if session_id in active_sessions:
        return True

    try:
        retriever = SessionFaissRetriever.load(session_id)
    except Exception as exc:
        logger.warning("⚠️ Could not restore session %s from disk: %s", session_id, exc)
        return False

    source_file = _find_uploaded_file_for_session(session_id)
    active_sessions[session_id] = {
        "retriever": retriever,
        "rag_chain": _build_rag_chain(retriever),
        "file_path": str(source_file) if source_file else str(retriever.index_dir),
        "file_name": source_file.name if source_file else f"{session_id}.pdf",
        "processed_at": time.time(),
        "restored": True,
    }
    logger.info("♻️ Restored session %s from persisted FAISS index", session_id)
    return True


# ═══════════════════════════════════════════════════════════════════════════
#   ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    return {"service": "EVBharat Compliance & Advisory API", "status": "running"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "active_sessions": len(active_sessions),
        "timestamp": time.time(),
    }


# ── free chat (no PDF required) ─────────────────────────────────────────────
@app.post("/free-chat", response_model=FreeChatResponse)
async def free_chat(request: FreeChatRequest):
    """Chat freely about Indian EV rules, laws, subsidies & compliance."""
    start = time.time()
    try:
        model = _get_llm()
        from langchain_core.messages import SystemMessage, HumanMessage

        try:
            response = model.invoke([
                SystemMessage(content=EV_SYSTEM_PROMPT),
                HumanMessage(content=request.message),
            ])
            response_text = response.content
        except Exception as invoke_exc:
            if _is_llm_access_error(invoke_exc):
                logger.warning("⚠️ LLM access denied for /free-chat; serving fallback response: %s", invoke_exc)
                response_text = _fallback_advisory_response(request.message)
            else:
                raise

        return FreeChatResponse(
            response=response_text,
            processing_time=time.time() - start,
        )
    except Exception as exc:
        logger.error("free-chat error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ── speech to text (Whisper) ───────────────────────────────────────────────
@app.post("/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(file: UploadFile = File(...)):
    """Transcribe uploaded speech audio to text using Whisper."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required.")

    allowed_audio = (".wav", ".mp3", ".m4a", ".webm", ".ogg", ".flac", ".aac")
    if not file.filename.lower().endswith(allowed_audio):
        raise HTTPException(
            status_code=400,
            detail="Only audio files are accepted: .wav, .mp3, .m4a, .webm, .ogg, .flac, .aac",
        )

    temp_audio = DATA_DIR / f"stt_{uuid.uuid4().hex}_{Path(file.filename).name}"
    start = time.time()
    try:
        with open(temp_audio, "wb") as buf:
            shutil.copyfileobj(file.file, buf)

        model = _get_whisper_model()
        segments, info = model.transcribe(
            str(temp_audio),
            beam_size=5,
            vad_filter=True,
        )

        transcript = " ".join(seg.text.strip() for seg in segments if seg.text).strip()
        language = getattr(info, "language", "unknown")

        return SpeechToTextResponse(
            text=transcript,
            language=language,
            processing_time=time.time() - start,
            model=os.getenv("WHISPER_MODEL", "base"),
        )
    except RuntimeError as exc:
        logger.error("speech-to-text setup error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        logger.error("speech-to-text error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Speech transcription failed: {exc}")
    finally:
        _safe_unlink(temp_audio)


# ── text to speech ──────────────────────────────────────────────────────────
@app.post("/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    """Synthesize speech audio (MP3) from text input."""
    start = time.time()
    try:
        tts_max_chars = max(200, int(os.getenv("TTS_MAX_CHARS", "1800")))
        normalized = _normalise_tts_text(request.text)
        text_to_speak, truncated = _truncate_tts_text(normalized, max_chars=tts_max_chars)

        cache_key = _tts_cache_key(text=text_to_speak, language=request.language, slow=request.slow)
        cached_audio = _tts_cache_get(cache_key)

        cache_status = "hit"
        provider = "cache"
        if cached_audio is None:
            cache_status = "miss"
            cached_audio, provider = await _synth_tts_audio(
                text=text_to_speak,
                language=request.language,
                slow=request.slow,
            )
            _tts_cache_put(cache_key, cached_audio)

        headers = {
            "Content-Disposition": 'inline; filename="speech.mp3"',
            "X-TTS-Provider": provider,
            "X-TTS-Cache": cache_status,
            "X-TTS-Processing-Ms": str(int((time.time() - start) * 1000)),
        }
        if truncated:
            headers["X-TTS-Truncated"] = "true"

        return Response(content=cached_audio, media_type="audio/mpeg", headers=headers)
    except ValueError as exc:
        logger.error("text-to-speech validation error: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc))
    except ImportError as exc:
        logger.error("text-to-speech dependency error: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="TTS dependency missing. Install edge-tts or gTTS.",
        )
    except Exception as exc:
        logger.error("text-to-speech error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Text-to-speech synthesis failed: {exc}")


# ── File upload (PDF & Images) ────────────────────────────────────────────────
@app.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload a PDF or image, extract content, build a RAG retriever for it."""
    # Validation
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required.")
    
    filename_lower = file.filename.lower()
    is_pdf = filename_lower.endswith(".pdf")
    is_image = filename_lower.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"))
    
    if not (is_pdf or is_image):
        raise HTTPException(status_code=400, detail="Only PDF (.pdf) and image (.jpg, .png, .webp, .gif, .bmp) files are accepted.")
    
    # Check file size (max 50 MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    MAX_SIZE = 50 * 1024 * 1024  # 50 MB
    if file_size > MAX_SIZE:
        raise HTTPException(status_code=413, detail=f"File too large. Max size: 50 MB, got {file_size / 1024 / 1024:.1f} MB")
    if file_size == 0:
        raise HTTPException(status_code=400, detail="File is empty.")

    session_id = str(uuid.uuid4())
    file_path = DATA_DIR / f"{session_id}_{file.filename}"

    try:
        file_type = "PDF" if is_pdf else "Image"
        logger.info(f"📥 Uploading {file_type}: {file.filename} ({file_size / 1024:.1f} KB)")
        
        # Save file
        with open(file_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)
        
        # Verify file was written
        if not file_path.exists():
            raise Exception("Failed to save uploaded file to disk")
        
        file_hash = hashlib.sha256(file_path.read_bytes()).hexdigest()
        logger.info(f"✅ File saved: {file_path.name} (hash: {file_hash[:8]}...)")

        # Process based on type
        if is_pdf:
            retriever = _process_pdf(str(file_path), session_id)
        else:
            retriever = _process_image(str(file_path), session_id)
        
        if not retriever or len(retriever.documents) == 0:
            raise Exception(f"{file_type} contains no extractable content")

        logger.info(f"✅ {file_type} processed: {len(retriever.documents)} documents in session {session_id}")
        
        return UploadResponse(
            success=True,
            message=f"{file_type} processed successfully. Extracted {len(retriever.documents)} chunks and stored embeddings in FAISS.",
            session_id=session_id,
            file_hash=file_hash,
            document_count=len(retriever.documents),
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"❌ Upload error: {exc}", exc_info=True)
        # Cleanup failed session
        if file_path.exists():
            try:
                file_path.unlink()
                logger.info(f"🧹 Cleaned up failed upload: {file_path}")
            except:
                pass
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(exc)}")


# ── RAG chat (PDF-based) ────────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with the uploaded PDF using RAG."""
    if request.session_id not in active_sessions and not _restore_session(request.session_id):
        raise HTTPException(status_code=404, detail="Session not found. Upload a PDF first.")

    rag_chain = active_sessions[request.session_id]["rag_chain"]
    start = time.time()
    try:
        answer = rag_chain(request.message)
        return ChatResponse(
            response=answer,
            session_id=request.session_id,
            processing_time=time.time() - start,
        )
    except Exception as exc:
        logger.error("chat error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ── session status / delete ──────────────────────────────────────────────────
@app.get("/sessions/{session_id}/status")
async def session_status(session_id: str):
    if session_id not in active_sessions and not _restore_session(session_id):
        return {"exists": False}
    s = active_sessions[session_id]
    retriever = s["retriever"]
    return {
        "exists": True,
        "processed_at": s["processed_at"],
        "file_path": Path(s["file_path"]).name,
        "document_count": len(retriever.documents),
        "vector_store": "faiss",
        "vector_index_path": str(retriever.index_dir),
    }


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    deleted_any = False

    session = active_sessions.pop(session_id, None)
    if session is not None:
        fp = Path(session.get("file_path", ""))
        if fp.exists() and fp.is_file():
            fp.unlink()
            deleted_any = True

        retriever = session.get("retriever")
        if retriever and hasattr(retriever, "index_dir"):
            idx_dir = Path(retriever.index_dir)
            if idx_dir.exists():
                _safe_rmtree(idx_dir)
                deleted_any = True

    source_file = _find_uploaded_file_for_session(session_id)
    if source_file and source_file.exists():
        source_file.unlink()
        deleted_any = True

    idx_dir = FAISS_INDEX_DIR / session_id
    if idx_dir.exists():
        _safe_rmtree(idx_dir)
        deleted_any = True

    if deleted_any:
        return {"message": "Session deleted."}
    return {"message": "Session already absent."}


# ═══════════════════════════════════════════════════════════════════════════
#   INTERNAL HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def _process_pdf(file_path: str, session_id: str) -> SessionFaissRetriever:
    """Extract content from the PDF with layered fallbacks."""
    
    # Verify file exists
    if not Path(file_path).exists():
        raise FileNotFoundError(f"PDF file not found: {file_path}")
    
    file_size = Path(file_path).stat().st_size
    logger.info(f"📄 Processing PDF: {Path(file_path).name} ({file_size / 1024:.1f} KB)")

    try:
        # Step 1: pdfminer (fast for digital PDFs)
        logger.info("🔍 Extracting text from PDF with pdfminer...")
        full_text = _extract_pdf_text_pdfminer(file_path)

        # Step 2: pypdf fallback
        if not full_text:
            logger.warning("⚠️ pdfminer returned no text; trying pypdf fallback...")
            full_text = _extract_pdf_text_pypdf(file_path)

        # Step 3: OCR fallback for scanned documents
        if not full_text:
            logger.warning("⚠️ pypdf returned no text; trying OCR fallback...")
            full_text = _extract_pdf_text_ocr(file_path)

        # Final fallback: keep flow alive with a clear placeholder
        if not full_text:
            logger.warning("⚠️ No extractable text found after all fallbacks; creating placeholder context")
            full_text = (
                f"Document '{Path(file_path).name}' appears to be image-based or contains no selectable text. "
                "Text extraction could not recover readable content."
            )
        
        logger.info(f"✅ Extracted text: {len(full_text)} characters")
        
        # Split into chunks for better retrieval
        chunk_size = 2000
        chunks = []
        words = full_text.split()
        current_chunk = []
        current_size = 0
        
        for word in words:
            current_chunk.append(word)
            current_size += len(word) + 1
            if current_size >= chunk_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_size = 0
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        if not chunks:
            chunks = [full_text[:2000], full_text[2000:4000], full_text[4000:]] if len(full_text) > 4000 else [full_text]
        
        logger.info(f"📊 Split into {len(chunks)} chunks")
        
        # Build FAISS retriever and persist vectors for this session
        retriever = SessionFaissRetriever.build(session_id=session_id, docs=chunks)

        # Store in session with RAG chain
        active_sessions[session_id] = {
            "retriever": retriever,
            "rag_chain": _build_rag_chain(retriever),
            "file_path": file_path,
            "file_name": Path(file_path).name,
            "processed_at": time.time(),
        }
        
        logger.info(f"✅ Session created: {session_id[:8]}... ({len(retriever.documents)} docs)")
        return retriever
        
    except FileNotFoundError as exc:
        logger.error(f"❌ File error: {exc}")
        raise
    except Exception as exc:
        logger.error(f"❌ PDF processing error: {exc}", exc_info=True)
        raise Exception(f"Failed to process PDF: {str(exc)}")


def _summarise(text: List[str], tables: List[str]):
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser
    from langchain_core.runnables import RunnablePassthrough

    prompt = ChatPromptTemplate.from_template(
        "Give a concise summary of the following chunk (text or table). "
        "Output ONLY the summary.\n\n{element}"
    )
    chain = {"element": RunnablePassthrough()} | prompt | _get_llm() | StrOutputParser()
    return (
        chain.batch(text, {"max_concurrency": 5}) if text else [],
        chain.batch(tables, {"max_concurrency": 5}) if tables else [],
    )


def _process_image(file_path: str, session_id: str) -> SessionFaissRetriever:
    """Extract content from an image using Claude vision."""
    from PIL import Image
    import base64
    
    # Verify file exists
    if not Path(file_path).exists():
        raise FileNotFoundError(f"Image file not found: {file_path}")
    
    file_size = Path(file_path).stat().st_size
    logger.info(f"🖼️  Processing image: {Path(file_path).name} ({file_size / 1024:.1f} KB)")

    try:
        # Verify it's a valid image
        logger.info("🔍 Validating image...")
        img = Image.open(file_path)
        img_size = img.size
        logger.info(f"✅ Image validated: {img_size[0]}x{img_size[1]} pixels")
        
        # Use vision LLM for image analysis
        logger.info("📝 Analyzing image with vision model...")
        model = _get_vision_llm()
        
        # Encode image to base64
        with open(file_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")
        
        # Get image format
        img_format = img.format.lower() if img.format else "jpeg"
        mime_type = f"image/{img_format}"
        
        # Get vision model that supports images
        from langchain_core.messages import HumanMessage
        
        vision_msg = [
            HumanMessage(
                content=[
                    {"type": "text", "text": "Please analyze this image related to electric vehicles. Describe what you see, any text, charts, or important information about EVs, batteries, charging, or Indian EV regulations. Be detailed and structured."},
                    {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{image_data}"}}
                ]
            )
        ]
        
        try:
            response = model.invoke(vision_msg)
            analysis = response.content
        except Exception as exc:
            logger.warning(f"⚠️  Vision analysis failed ({exc}); using filename as fallback")
            analysis = f"Image file: {Path(file_path).name}\nImage size: {img_size[0]}x{img_size[1]} pixels"
        
        if not analysis or not analysis.strip():
            raise ValueError("Image analysis produced no content")
        
        logger.info(f"✅ Image analyzed: {len(analysis)} characters")
        
        # Split into chunks
        chunk_size = 2000
        chunks = []
        words = analysis.split()
        current_chunk = []
        current_size = 0
        
        for word in words:
            current_chunk.append(word)
            current_size += len(word) + 1
            if current_size >= chunk_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_size = 0
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        if not chunks:
            chunks = [analysis]
        
        logger.info(f"📊 Split into {len(chunks)} chunks")
        
        # Build FAISS retriever and persist vectors for this session
        retriever = SessionFaissRetriever.build(session_id=session_id, docs=chunks)
        
        # Store in session
        active_sessions[session_id] = {
            "retriever": retriever,
            "rag_chain": _build_rag_chain(retriever),
            "file_path": file_path,
            "file_name": Path(file_path).name,
            "processed_at": time.time(),
        }
        
        logger.info(f"✅ Session created: {session_id[:8]}... ({len(retriever.documents)} docs)")
        return retriever
        
    except FileNotFoundError as exc:
        logger.error(f"❌ File error: {exc}")
        raise
    except ValueError as exc:
        logger.error(f"❌ Image content error: {exc}")
        raise
    except Exception as exc:
        logger.error(f"❌ Image processing error: {exc}", exc_info=True)
        raise Exception(f"Failed to process image: {str(exc)}")


def _build_rag_chain(retriever: SessionFaissRetriever):
    from langchain_core.prompts import ChatPromptTemplate

    tpl = (
        EV_SYSTEM_PROMPT
        + "\n\n---\nAdditional document context:\n{context}\n---\n\n"
        "User question:\n{question}"
    )
    prompt = ChatPromptTemplate.from_template(tpl)
    model = _get_llm()

    def _chain(question: str) -> str:
        docs = retriever.invoke(question)
        ctx = "\n\n".join(docs)
        try:
            resp = model.invoke(prompt.format(context=ctx, question=question))
            return resp.content
        except Exception as exc:
            if _is_llm_access_error(exc):
                logger.warning("⚠️ LLM access denied for document chat; serving fallback response: %s", exc)
                return _fallback_advisory_response(question=question, docs=docs)
            raise

    return _chain


# ── entrypoint ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000, log_level="info")
