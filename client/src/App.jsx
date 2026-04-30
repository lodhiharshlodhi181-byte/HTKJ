import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import AIChat from './pages/AIchat';
import Quiz from './pages/quiz';
import UploadPaper from './pages/uploadpaper';
import Login from './pages/login';
import LearningPath from './pages/LearningPath';
import StudyMaterial from './pages/StudyMaterial';
import EvaluateAssignment from './pages/EvaluateAssignment';
import VivaMode from './pages/VivaMode';
import Matchmaking from './pages/Matchmaking';

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
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/learning-path" element={<LearningPath />} />
            <Route path="/study" element={<StudyMaterial />} />
            <Route path="/evaluate" element={<EvaluateAssignment />} />
            <Route path="/viva" element={<VivaMode />} />
            <Route path="/matchmaking" element={<Matchmaking />} />
          </Routes>
        </main>
        <AIChat />
      </div>
    </Router>
  );
}

export default App;