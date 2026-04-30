import os
import google.generativeai as genai

def conduct_viva(query: str, history: list, topic: str):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return "Please configure the Gemini API Key to start the Viva."

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash-latest")
    
    chat_history = []
    
    # We prime the AI with the system instruction in the first message if history is empty
    if not history:
        system_prompt = f"You are a strict university examiner conducting an oral viva on the topic of '{topic}'. Ask one specific question at a time. Evaluate the student's answer briefly (point out mistakes if any), and then ask the next question. Keep your responses under 3 sentences to mimic spoken dialogue. Do not give away the full answer immediately."
        chat_history.append({"role": "user", "parts": [system_prompt]})
        chat_history.append({"role": "model", "parts": [f"Understood. I will begin the viva on {topic}. Are you ready?"]})
    else:
        # Convert frontend history to gemini format
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            chat_history.append({"role": role, "parts": [msg["text"]]})
    
    try:
        chat = model.start_chat(history=chat_history)
        response = chat.send_message(query)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"
