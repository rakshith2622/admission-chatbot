from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas import ChatRequest

from backend.rag import get_answer

from admin_api import router as admin_router

app = FastAPI(title="Admission Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)

@app.get("/")
def health():
    return {"status": "Backend is running"}

@app.post("/chat")
def chat(request: ChatRequest):
    result = get_answer(request.query)
    return {
        "short_answer": result["short_answer"],
        "full_answer": result["full_answer"],
    }
