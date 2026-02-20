from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

# FastAPI app initialization
app = FastAPI(title="EVBharat RAG API - Test", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str = "test"

class ChatResponse(BaseModel):
    response: str
    session_id: str
    processing_time: float

@app.get("/")
async def root():
    return {"message": "EVBharat RAG API Test is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time()
    }

@app.post("/test-chat", response_model=ChatResponse)
async def test_chat(request: ChatRequest):
    """Test chat endpoint without PDF processing."""
    
    start_time = time.time()
    
    # Simple test response
    response = f"Test response for: '{request.message}'. This is a working API!"
    
    processing_time = time.time() - start_time
    
    return ChatResponse(
        response=response,
        session_id=request.session_id,
        processing_time=processing_time
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")