from fastapi import UploadFile
from typing import List
import os
import json
import google.generativeai as genai
import PyPDF2
import io

def analyze_paper(files: List[UploadFile]):
    api_key = os.getenv("GEMINI_API_KEY", "")
    
    analyzed_filenames = []
    combined_text = ""
    
    # Read all PDFs and aggregate text
    for file in files:
        analyzed_filenames.append(file.filename)
        content = file.file.read()
        
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = ""
            for i in range(min(5, len(pdf_reader.pages))):
                page = pdf_reader.pages[i]
                text += page.extract_text() + "\n"
            combined_text += f"\n--- Content from {file.filename} ---\n{text}"
        except Exception as e:
            combined_text += f"\n--- Could not read {file.filename} ---\n"
            
    if not api_key:
        return {
            "filenames": analyzed_filenames,
            "expectedTopics": ["Mock Topic 1", "Mock Topic 2", "Data Structures"],
            "mockPaper": [
                {"id": 1, "questionText": "What is an Array?", "marks": 5},
                {"id": 2, "questionText": "Explain Dynamic Programming.", "marks": 10}
            ],
            "message": "API key missing. Returning mocked generated paper."
        }
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-flash-latest", generation_config={"response_mime_type": "application/json"})
    
    prompt = f"""
    You are an expert academic professor. I am providing you with text extracted from {len(files)} previous year question papers.
    Analyze the trends, frequently asked topics, and question patterns from these papers.
    Generate a brand new "Expected Question Paper" based on your analysis.
    Output MUST be valid JSON in this exact format:
    {{
        "expectedTopics": ["list of 3-5 high probability topics"],
        "mockPaper": [
            {{"id": 1, "questionText": "...", "marks": 5}},
            {{"id": 2, "questionText": "...", "marks": 10}}
        ]
    }}
    Extract 5-10 questions for the mock paper. Provide an adequate mix of short and long mark questions. Keep the text concise but realistic.
    
    Extracted Text:
    {combined_text[:15000]} 
    """
    try:
        response = model.generate_content(prompt)
        result_data = json.loads(response.text)
        
        return {
            "filenames": analyzed_filenames,
            "expectedTopics": result_data.get("expectedTopics", []),
            "mockPaper": result_data.get("mockPaper", []),
            "message": "Analyzed and expected paper generated successfully."
        }
    except Exception as e:
        return {"error": str(e)}
