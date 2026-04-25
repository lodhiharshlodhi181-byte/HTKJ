import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import AIChat from './pages/AIchat';
import Quiz from './pages/quiz';
import UploadPaper from './pages/uploadpaper';
import Analytics from './pages/analytics';
import Login from './pages/login';
import LearningPath from './pages/LearningPath';
import StudyNotes from './pages/StudyNotes';
import EvaluateAssignment from './pages/EvaluateAssignment';

function App() {
  return (
    <Router>
      <div className="min-h-screen text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/upload" element={<UploadPaper />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/learning-path" element={<LearningPath />} />
            <Route path="/notes" element={<StudyNotes />} />
            <Route path="/evaluate" element={<EvaluateAssignment />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;