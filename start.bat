@echo off
echo Starting AI Education Assistant Services...

:: Start API Backend (Node.js)
start cmd /k "title Node.js Server && cd server && npm run dev"

:: Start Client Frontend (React/Vite)
start cmd /k "title React Client && cd client && npm run dev"

:: Start AI Service (Python FastAPI)
start cmd /k "title Python AI Server && cd ai && uvicorn main:app --reload"

echo All services have been launched in separate windows!
