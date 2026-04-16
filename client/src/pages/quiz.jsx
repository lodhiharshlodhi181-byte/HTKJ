import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Sparkles, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { submitQuizResult } from '../assets/services/userAPI';
import { useNavigate } from 'react-router-dom';

const Quiz = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizData, setQuizData] = useState(null);
  
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft === null || isSubmitted) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timerObj = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timerObj);
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds) => {
    if (seconds === null) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setFinalScore(null);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ai/quiz', {
        topic,
        difficulty,
        num_questions: parseInt(numQuestions)
      });
      setQuizData(res.data);
      if (parseInt(timerMinutes) > 0) {
        setTimeLeft(parseInt(timerMinutes) * 60);
      } else {
        setTimeLeft(null);
      }
    } catch (err) {
      alert('Error generating quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAnswer = (qIndex, option) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: option
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        topic,
        difficulty,
        questions: quizData,
        selectedAnswers
      };
      
      const res = await submitQuizResult(payload);
      setFinalScore(res.data.score);
      setIsSubmitted(true);
    } catch (err) {
      console.error("DEBUG SUBMIT ERROR:", err.response?.data || err.message);
      alert('Error Details: ' + JSON.stringify(err.response?.data || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonClass = (qIndex, opt, correctAnswer) => {
    const isSelected = selectedAnswers[qIndex] === opt;
    
    if (!isSubmitted) {
      return isSelected 
        ? "bg-purple-500/20 border-purple-500 ring-2 ring-purple-500" 
        : "bg-white/5 border-white/10 hover:border-purple-500 hover:bg-purple-500/10";
    }

    const isCorrectChoice = opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    if (isCorrectChoice) {
      return "bg-green-500/20 border-green-500 ring-2 ring-green-500 text-green-300 font-bold";
    }

    if (isSelected && !isCorrectChoice) {
      return "bg-red-500/20 border-red-500 ring-2 ring-red-500 text-red-300";
    }

    return "bg-white/5 border-white/10 opacity-50 cursor-not-allowed";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {!isSubmitted && (
        <div className="glass-card p-8 text-center space-y-6">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            AI Quiz Generator
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Enter a topic you want to test yourself on, and our AI will generate a set of customized questions.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center max-w-3xl mx-auto mt-6">
            <input 
              type="text" 
              placeholder="E.g., Quantum Mechanics..." 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 min-w-[200px] bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 w-full text-white"
            />
            <select 
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none text-gray-300 w-full sm:w-auto"
            >
              <option value="easy" className="bg-[#030014]">Easy</option>
              <option value="medium" className="bg-[#030014]">Medium</option>
              <option value="hard" className="bg-[#030014]">Hard</option>
            </select>
            <select 
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none text-gray-300 w-full sm:w-auto"
            >
              <option value={5} className="bg-[#030014]">5 Qs</option>
              <option value={10} className="bg-[#030014]">10 Qs</option>
              <option value={15} className="bg-[#030014]">15 Qs</option>
            </select>
            <select 
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none text-gray-300 w-full sm:w-auto"
            >
              <option value={0} className="bg-[#030014]">No Timer</option>
              <option value={2} className="bg-[#030014]">2 Mins</option>
              <option value={5} className="bg-[#030014]">5 Mins</option>
              <option value={10} className="bg-[#030014]">10 Mins</option>
            </select>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all w-full sm:w-auto disabled:opacity-50 mt-2 sm:mt-0"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
              {isGenerating ? 'Generating...' : 'Generate AI Quiz'}
            </button>
          </div>
        </div>
      )}

      {isSubmitted && finalScore !== null && (
        <div className="glass-card p-8 text-center space-y-4 border border-purple-500/50 bg-purple-500/5 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
            Quiz Complete!
          </h2>
          <p className="text-xl text-gray-300">
            You scored <strong className="text-2xl text-white outline-2 px-2">{finalScore}</strong> out of <strong className="text-2xl text-white">{quizData.length}</strong>
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-bold transition">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {quizData && (
        <div className="space-y-6">
          {!isSubmitted && timeLeft !== null && (
            <div className={`sticky top-4 z-50 glass-card mx-auto max-w-sm px-6 py-3 flex justify-between items-center text-xl font-bold font-mono transition-all duration-1000 ${timeLeft < 60 ? 'border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.5)] bg-red-900/20' : 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]'}`}>
              <span className="flex items-center gap-2 text-gray-300">
                <Clock size={24} className={`transition-transform duration-500 ${timeLeft < 60 ? 'text-red-400 animate-bounce' : 'text-purple-400 animate-pulse'}`} /> 
                <span className="tracking-wide">Time Left:</span>
              </span>
              <span className={`transition-all duration-500 font-extrabold ${timeLeft < 60 ? 'text-red-400 animate-pulse scale-110 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          {quizData.map((q, idx) => (
            <div key={idx} className={`glass-card p-6 border-l-4 group transition-colors duration-300 ${isSubmitted ? (selectedAnswers[idx]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase() ? 'border-l-green-500' : 'border-l-red-500') : 'border-l-purple-500'}`}>
              <h4 className="text-lg font-medium mb-4 text-gray-200">
                <span className="text-purple-400 font-bold mr-2">Q{idx + 1}.</span> {q.questionText}
              </h4>
              <div className="flex flex-col gap-3">
                {q.options?.map((opt, oIdx) => (
                  <button 
                    key={oIdx} 
                    onClick={() => handleSelectAnswer(idx, opt)}
                    disabled={isSubmitted}
                    className={`text-left p-4 rounded-lg transition-all duration-200 flex justify-between items-center ${getButtonClass(idx, opt, q.correctAnswer)}`}
                  >
                    <span className="font-medium">{opt}</span>
                    {isSubmitted && opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() && (
                      <CheckCircle2 size={18} className="text-green-400" />
                    )}
                  </button>
                ))}
              </div>
              
              {isSubmitted && q.explanation && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 text-sm text-blue-200">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p><strong>Explanation:</strong> {q.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {!isSubmitted && (
            <div className="flex justify-end sticky bottom-4 z-10 pt-4">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(selectedAnswers).length < quizData.length}
                className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} 
                {isSubmitting ? 'Evaluating...' : 'Submit Answers'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;