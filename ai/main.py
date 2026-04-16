from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="../server/.env")

from scripts.doubt_solver import solve_doubt
from scripts.quiz_generator import generate_quiz
from scripts.paper_analyzer import analyze_paper
from scripts.performance import detect_weak_topics

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI Education Assistant Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DoubtRequest(BaseModel):
    query: str
    context: Optional[str] = None
    language: Optional[str] = "English"

class QuizRequest(BaseModel):
    topic: str
    difficulty: Optional[str] = "medium"
    num_questions: Optional[int] = 5

@app.get("/")
def read_root():
    return {"status": "AI Engine is running"}

@app.post("/api/ai/doubt")
async def handle_doubt(req: DoubtRequest):
    return solve_doubt(req.query, req.context, req.language)

@app.post("/api/ai/quiz")
async def handle_quiz_generation(req: QuizRequest):
    return generate_quiz(req.topic, req.difficulty, req.num_questions)

@app.post("/api/ai/analyze-paper")
async def handle_paper_upload(files: List[UploadFile] = File(...)):
    return await analyze_paper(files)

@app.post("/api/ai/performance")
async def handle_performance(data: dict):
    # data should contain quiz results logic
    return detect_weak_topics(data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
