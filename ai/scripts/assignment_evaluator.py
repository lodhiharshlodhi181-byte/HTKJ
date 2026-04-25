import os
import json
import google.generativeai as genai

def evaluate_assignment(question: str, answer: str, max_marks: int = 100):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return {"error": "Gemini API Key not found. Please add to .env!"}
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-flash-latest")
    
    prompt = f"""
    You are an expert AI Examiner evaluating a student's assignment.
    
    Question / Prompt: "{question}"
    Student's Answer: "{answer}"
    Maximum Possible Marks: {max_marks}
    
    Evaluate the student's answer based on accuracy, completeness, and depth of understanding. Be fair but strict.
    Return your evaluation strictly as a valid JSON object matching the following structure without any markdown formatting or codeblocks:
    {{
        "score": 85,
        "max_marks": {max_marks},
        "feedback": "Overall good job. Here are some specific points...",
        "strengths": ["clear structure", "accurate definition"],
        "areas_for_improvement": ["missing examples", "minor grammatical errors"],
        "correct_answer_hints": "The ideal answer should have included..."
    }}
    
    MANDATORY: Make sure to output ONLY JSON. No other text or markdown block markers.
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up potential markdown framing
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
            
        data = json.loads(text.strip())
        return data
    except json.JSONDecodeError:
        return {"error": "JSON parse error", "message": "AI returned malformed data. Try again."}
    except Exception as e:
        return {"error": str(e), "message": "Failed to evaluate assignment"}
