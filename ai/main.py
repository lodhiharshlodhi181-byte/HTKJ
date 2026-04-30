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
from scripts.learning_path import generate_learning_path
from scripts.notes_generator import generate_study_notes
from scripts.assignment_evaluator import evaluate_assignment
from scripts.viva_examiner import conduct_viva

from fastapi.middleware.cors import CORSMiddleware

import pytesseract
from PIL import Image
import io

def extract_text_from_file(file: UploadFile) -> str:
    content = file.file.read()
    filename = file.filename.lower()
    
    try:
        if filename.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
            # Image file, use OCR
            image = Image.open(io.BytesIO(content))
            text = pytesseract.image_to_string(image)
            return text.strip()
        elif filename.endswith('.txt'):
            # Text file
            return content.decode('utf-8').strip()
        elif filename.endswith('.pdf'):
            # PDF file
            from PyPDF2 import PdfReader
            pdf = PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf.pages:
                text += page.extract_text()
            return text.strip()
        else:
            # Assume text
            return content.decode('utf-8').strip()
    except Exception as e:
        return f"Error extracting text: {str(e)}"

import pytesseract
from PIL import Image
import io

app = FastAPI(title="AI Education Assistant Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DoubtRequest(BaseModel):
    query: str
    context: Optional[str] = None
    language: Optional[str] = "English"

class LearningPathRequest(BaseModel):
    topic: str

class NotesRequest(BaseModel):
    topic: str

class AssignmentRequest(BaseModel):
    question: str
    answer: Optional[str] = None
    max_marks: Optional[int] = 100

class QuizRequest(BaseModel):
    topic: str
    difficulty: Optional[str] = "medium"
    num_questions: Optional[int] = 5

class VivaRequest(BaseModel):
    query: str
    topic: str
    history: list = []

@app.get("/")
def read_root():
    return {"status": "AI Engine is running"}

@app.post("/api/ai/doubt")
def handle_doubt(req: DoubtRequest):
    return solve_doubt(req.query, req.context, req.language)

@app.post("/api/ai/quiz")
def handle_quiz_generation(req: QuizRequest):
    return generate_quiz(req.topic, req.difficulty, req.num_questions)

@app.post("/api/ai/viva")
def handle_viva(req: VivaRequest):
    return conduct_viva(req.query, req.history, req.topic)

@app.post("/api/ai/analyze-paper")
def handle_paper_upload(files: List[UploadFile] = File(...)):
    return analyze_paper(files)

@app.post("/api/ai/performance")
def handle_performance(data: dict):
    # data should contain quiz results logic
    return detect_weak_topics(data)

@app.post("/api/ai/learning-path")
def handle_learning_path(req: LearningPathRequest):
    return generate_learning_path(req.topic)

@app.post("/api/ai/notes")
def handle_notes(req: NotesRequest):
    return generate_study_notes(req.topic)

from fastapi import Form

@app.post("/api/ai/evaluate-assignment")
def handle_assignment_eval(
    question: str = Form(...),
    answer: Optional[str] = Form(None),
    max_marks: int = Form(100),
    file: UploadFile = File(None)
):
    if file:
        # Extract answer from file
        extracted_answer = extract_text_from_file(file)
    else:
        # Use provided answer
        extracted_answer = answer
    
    if not extracted_answer:
        return {"error": "No answer provided"}
    
    return evaluate_assignment(question, extracted_answer, max_marks)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
