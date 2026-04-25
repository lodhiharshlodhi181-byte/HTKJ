import requests

url = "https://htkj-3.onrender.com/api/ai/quiz"
payload = {"topic": "history", "num_questions": 2}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    print("Status:", response.status_code)
    print("Body:", response.text)
except Exception as e:
    print("Error:", str(e))
