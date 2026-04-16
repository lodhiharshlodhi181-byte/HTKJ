import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AIChat from './pages/AIChat';
import Quiz from './pages/Quiz';
import UploadPaper from './pages/UploadPaper';
import Analytics from './pages/Analytics';
import Login from './pages/login';

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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;