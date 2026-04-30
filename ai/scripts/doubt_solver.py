import os
import google.generativeai as genai

def solve_doubt(query: str, context: str = None, language: str = "English"):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return {"answer": f"[{language}] Gemini API Key not found. Please add to .env! (Placeholder answer for: {query})"}
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    prompt = f"You are an AI Tutor. The user asks: '{query}' in {language}."
    if context:
        prompt += f" Context provided: {context}."
        
    try:
        response = model.generate_content(prompt)
        return {"answer": response.text}
    except Exception as e:
        return {"error": str(e), "answer": f"Error calling Gemini: {str(e)}"}
