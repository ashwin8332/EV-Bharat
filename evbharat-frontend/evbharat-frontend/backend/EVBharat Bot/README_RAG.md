# EVBharat RAG Backend API

A FastAPI-based backend that provides Retrieval-Augmented Generation (RAG) capabilities for PDF document analysis and chat.

## Features

- **PDF Upload & Processing**: Upload PDFs and extract text and tables using the Unstructured library
- **AI-Powered Chat**: Chat with your documents using Google Gemini AI
- **Session Management**: Each uploaded document creates a session for isolated conversations
- **RESTful API**: Clean REST API endpoints for frontend integration
- **File Storage**: Uploaded files are safely stored in the `data/` directory

## Quick Start

### 1. Start the Backend Server

```bash
# Make sure you're in the EVBharat Bot directory
cd "/workspaces/ev/evbharat-frontend/evbharat-frontend/backend/EVBharat Bot"

# Run the startup script
./start_rag_backend.sh
```

The server will start on `http://localhost:8001`

### 2. API Documentation

Once the server is running, visit:
- **Interactive API Docs**: http://localhost:8001/docs
- **Alternative Docs**: http://localhost:8001/redoc

## API Endpoints

### Upload PDF
```http
POST /upload
Content-Type: multipart/form-data

# Form data: file (PDF file)
```

**Response:**
```json
{
  "success": true,
  "message": "PDF uploaded and processed successfully",
  "session_id": "uuid-string",
  "file_hash": "sha256-hash"
}
```

### Chat with Document
```http
POST /chat
Content-Type: application/json

{
  "message": "Your question about the document",
  "session_id": "uuid-string"
}
```

**Response:**
```json
{
  "response": "AI generated response",
  "session_id": "uuid-string", 
  "processing_time": 2.34
}
```

### Get Session Status
```http
GET /sessions/{session_id}/status
```

### Delete Session
```http
DELETE /sessions/{session_id}
```

### Health Check
```http
GET /health
```

## Environment Variables

Create a `.env` file with the following variables:

```env
GOOGLE_API_KEY=your_google_api_key_here
GROQ_API_KEY=your_groq_api_key_here  # Optional, for alternative models
```

## File Structure

```
EVBharat Bot/
├── rag_api.py              # Main FastAPI application
├── start_rag_backend.sh    # Startup script
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (create this)
├── data/                  # Uploaded files storage
└── README_RAG.md          # This file
```

## Dependencies

Key dependencies include:
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **Unstructured**: PDF processing
- **LangChain**: AI workflow orchestration
- **Google Generative AI**: Gemini AI integration

## Usage Examples

### Frontend Integration

The frontend TypeScript code can interact with the API like this:

```typescript
// Upload PDF
const formData = new FormData();
formData.append('file', pdfFile);
const uploadResponse = await fetch('http://localhost:8001/upload', {
    method: 'POST',
    body: formData
});

// Chat with document
const chatResponse = await fetch('http://localhost:8001/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        message: "What is this document about?",
        session_id: sessionId
    })
});
```

## Security Notes

- **CORS**: Currently configured for development (allows all origins)
- **File Validation**: Only PDF files are accepted
- **Session Isolation**: Each session maintains separate document context
- **Auto Cleanup**: Sessions can be manually deleted via API

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all dependencies are installed with `pip install -r requirements.txt`
2. **API Key Errors**: Ensure your `GOOGLE_API_KEY` is set in the `.env` file
3. **File Upload Fails**: Check file size limits and ensure the file is a valid PDF
4. **CORS Issues**: In production, update the CORS configuration with your actual domain

### Logs

The application logs important events. Check the terminal output for debugging information.

### File Cleanup

Uploaded files are stored in the `data/` directory. You can manually clean old files or implement automatic cleanup as needed.

## Production Deployment

For production deployment:

1. Update CORS origins in `rag_api.py`
2. Set appropriate environment variables
3. Use a proper ASGI server configuration
4. Implement proper logging and monitoring
5. Add authentication if needed
6. Configure file upload limits
7. Set up automatic file cleanup

## Integration with Frontend

This backend is designed to work with the EVBharat frontend React/TypeScript application. The frontend page is located at:
- Frontend Page: `/src/pages/rag-chat.ts`
- Navigation: Accessible via Dashboard → AI Assistant

The frontend provides:
- Drag & drop PDF upload interface
- Real-time chat interface
- Session management
- Error handling and user feedback