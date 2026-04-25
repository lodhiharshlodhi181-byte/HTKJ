import os
import json
import google.generativeai as genai

def generate_learning_path(topic: str):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return {"error": "Gemini API Key not found. Please add to .env!"}
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-flash-latest")
    
    prompt = f"""
    You are an expert AI Tutor. Create a comprehensive, step-by-step personalized learning path for the topic: '{topic}'.
    Return the result strictly as a valid JSON object matching the following structure without any markdown formatting or code blocks:
    {{
        "topic": "{topic}",
        "description": "A brief overview of what this learning path covers and the expected outcome.",
        "modules": [
            {{
                "id": 1,
                "title": "Module Title",
                "description": "What to learn in this module and why it is important.",
                "estimated_time": "e.g., 2 hours",
                "topics": ["sub-topic 1", "sub-topic 2"]
            }}
        ]
    }}
    
    MANDATORY: Make sure to output ONLY JSON. No other text or markdown block markers.
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean up potential markdown if the model hallucinates it
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
            
        path_data = json.loads(text.strip())
        return path_data
    except json.JSONDecodeError:
        return {"error": "JSON parse error", "message": "AI returned malformed data. Try again."}
    except Exception as e:
        return {"error": str(e), "message": "Failed to generate learning path"}
