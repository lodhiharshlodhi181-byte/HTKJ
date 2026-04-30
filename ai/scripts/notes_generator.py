import os
import google.generativeai as genai

def generate_study_notes(topic: str):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return {"error": "Gemini API Key not found. Please add to .env!"}
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-pro")
    
    prompt = f"""
    You are an expert Professor generating high-quality study notes.
    Generate comprehensive, detailed, and easy-to-understand study notes for the topic: '{topic}'.
    
    Requirements:
    1. Organize the notes logically using Markdown formatting (H1, H2, H3).
    2. Include bullet points, numbered lists, and bold text for emphasis.
    3. Start with a brief overview/introduction.
    4. Provide key concepts, formulas (if applicable), and examples.
    5. End with a quick summary or key takeaways.
    
    Make sure the response is purely the markdown text without any introductory conversational filler like "Here are your notes...".
    """
    
    try:
        response = model.generate_content(prompt)
        return {"notes": response.text.strip()}
    except Exception as e:
        return {"error": str(e), "message": "Failed to generate study notes"}
