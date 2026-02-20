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

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, hashlib, shutil, uuid, time, logging
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

# ── in-memory session store ──────────────────────────────────────────────────
active_sessions: Dict[str, Any] = {}

# ── lazy helpers ─────────────────────────────────────────────────────────────
_llm_instance = None


def _get_llm():
    """Return a cached ChatGoogleGenerativeAI instance (lazy-loaded)."""
    global _llm_instance
    if _llm_instance is None:
        from langchain_google_genai import ChatGoogleGenerativeAI
        _llm_instance = ChatGoogleGenerativeAI(
            temperature=0.6,
            model="gemini-2.5-flash",
        )
        logger.info("LLM initialised (gemini-2.5-flash)")
    return _llm_instance


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


# ── Simple retriever ────────────────────────────────────────────────────────
class SimpleInMemoryRetriever:
    def __init__(self):
        self.documents: List[str] = []
        self.summaries: List[str] = []

    def add_documents(self, docs: List[str], summaries: List[str]):
        self.documents.extend(docs)
        self.summaries.extend(summaries)

    def invoke(self, _query: str):
        return self.documents[: min(5, len(self.documents))]


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

        response = model.invoke([
            SystemMessage(content=EV_SYSTEM_PROMPT),
            HumanMessage(content=request.message),
        ])
        return FreeChatResponse(
            response=response.content,
            processing_time=time.time() - start,
        )
    except Exception as exc:
        logger.error("free-chat error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


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
            message=f"{file_type} processed successfully. Extracted {len(retriever.documents)} chunks.",
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
    if request.session_id not in active_sessions:
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
    if session_id not in active_sessions:
        return {"exists": False}
    s = active_sessions[session_id]
    return {
        "exists": True,
        "processed_at": s["processed_at"],
        "file_path": Path(s["file_path"]).name,
        "document_count": len(s["retriever"].documents),
    }


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    fp = Path(active_sessions[session_id]["file_path"])
    if fp.exists():
        fp.unlink()
    del active_sessions[session_id]
    return {"message": "Session deleted."}


# ═══════════════════════════════════════════════════════════════════════════
#   INTERNAL HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def _process_pdf(file_path: str, session_id: str) -> SimpleInMemoryRetriever:
    """Extract content from the PDF using lightweight pdfminer."""
    from pdfminer.high_level import extract_text
    
    # Verify file exists
    if not Path(file_path).exists():
        raise FileNotFoundError(f"PDF file not found: {file_path}")
    
    file_size = Path(file_path).stat().st_size
    logger.info(f"📄 Processing PDF: {Path(file_path).name} ({file_size / 1024:.1f} KB)")

    try:
        # Extract text using pdfminer (lightweight, no PyTorch/inference libs needed)
        logger.info("🔍 Extracting text from PDF...")
        full_text = extract_text(file_path)
        
        if not full_text or not full_text.strip():
            raise ValueError("PDF contains no extractable text (empty or corrupted)")
        
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
        
        # Build summaries by truncating chunks
        summaries = [ch[:300] + "..." if len(ch) > 300 else ch for ch in chunks]
        
        # Initialize retriever and add documents
        retriever = SimpleInMemoryRetriever()
        retriever.add_documents(chunks, summaries)

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
    except ValueError as exc:
        logger.error(f"❌ PDF content error: {exc}")
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


def _process_image(file_path: str, session_id: str) -> SimpleInMemoryRetriever:
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
        
        # Use LLM for image analysis
        logger.info("📝 Analyzing image with vision model...")
        model = _get_llm()
        
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
        
        # Build summaries
        summaries = [ch[:300] + "..." if len(ch) > 300 else ch for ch in chunks]
        
        # Initialize retriever
        retriever = SimpleInMemoryRetriever()
        retriever.add_documents(chunks, summaries)
        
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


def _build_rag_chain(retriever: SimpleInMemoryRetriever):
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
        resp = model.invoke(prompt.format(context=ctx, question=question))
        return resp.content

    return _chain


# ── entrypoint ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
