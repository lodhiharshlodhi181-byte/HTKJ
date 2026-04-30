import os
import json
import google.generativeai as genai

def generate_quiz(topic: str, difficulty: str = "medium", num_questions: int = 5):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return [{
            "questionText": f"Dummy question about {topic} ({difficulty})?",
            "options": ["Opt 1", "Opt 2", "Opt 3", "Opt 4"],
            "correctAnswer": "Opt 1",
            "explanation": "Add API key for real quizzes."
        }]
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash", generation_config={"response_mime_type": "application/json"})
    
    prompt = f"Generate a {num_questions}-question JSON array of multiple choice questions about '{topic}' at a {difficulty} level. Format: [{{'questionText': '...', 'options': ['...', ...], 'correctAnswer': '...', 'explanation': '...'}}]"
    try:
        response = model.generate_content(prompt)
        quiz_data = json.loads(response.text)
        return quiz_data
    except Exception as e:
        return {"error": str(e)}
