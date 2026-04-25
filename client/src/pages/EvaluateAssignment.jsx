import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle2, AlertCircle, Loader2, Award, Zap, ThumbsUp, Type, AlertTriangle, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const EvaluateAssignment = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [file, setFile] = useState(null);
  const [maxMarks, setMaxMarks] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!question.trim() || (!answer.trim() && !file)) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('question', question.trim());
      if (answer.trim()) {
        formData.append('answer', answer.trim());
      }
      formData.append('max_marks', parseInt(maxMarks) || 10);
      if (file) {
        formData.append('file', file);
      }

      const res = await axios.post('http://127.0.0.1:8000/api/ai/evaluate-assignment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (res.data.error) {
        setError(res.data.message || res.data.error);
      } else {
        setResult(res.data);
      }
    } catch (err) {
      setError('Failed to evaluate assignment. Make sure the AI Engine is running.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score, max) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-400 border-green-500/50 bg-green-500/10 shadow-[0_0_20px_rgba(74,222,128,0.2)]';
    if (percentage >= 50) return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_20px_rgba(250,204,21,0.2)]';
    return 'text-red-400 border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(248,113,113,0.2)]';
  };

  return (
    <div className="flex flex-col items-center gap-8 pb-16 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="w-full text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-500 flex items-center justify-center gap-4">
          <Award size={40} className="text-orange-400" />
          AI Assignment Evaluator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Paste a question and your answer below to get instant grading, actionable feedback, and hints from our AI Instructor.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleEvaluate} className="w-full glass-card p-6 md:p-8 border border-white/10 rounded-2xl space-y-6 relative overflow-hidden group hover:border-orange-500/30 transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
        
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold tracking-wider text-gray-300 uppercase flex items-center gap-2">
              <Type size={16} className="text-orange-400" /> Question / Prompt
            </label>
            <textarea
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all min-h-[100px] resize-y"
              placeholder="Enter the question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold tracking-wider text-gray-300 uppercase flex items-center gap-2">
              <ThumbtackPlaceholder className="text-rose-400" /> Your Answer
            </label>
            <textarea
               className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all min-h-[200px] resize-y"
               placeholder="Paste your answer to be evaluated..."
               value={answer}
               onChange={(e) => setAnswer(e.target.value)}
               disabled={loading}
            />
            <p className="text-xs text-gray-500">Or upload a file/photo of your answer below</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold tracking-wider text-gray-300 uppercase flex items-center gap-2">
              <Upload className="text-blue-400" /> Upload Assignment File/Photo
            </label>
            <input
              type="file"
              accept=".txt,.pdf,.png,.jpg,.jpeg,.bmp,.tiff"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={loading}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-bold text-gray-400 whitespace-nowrap">Max Marks:</label>
              <input
                type="number"
                min="1"
                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500 w-24 text-center font-bold"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <button
               type="submit"
               disabled={loading || !question.trim() || (!answer.trim() && !file)}
               className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                 loading || !question.trim() || (!answer.trim() && !file)
                   ? 'bg-rose-600/30 text-white/50 cursor-not-allowed border border-rose-500/20'
                   : 'bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)]'
               }`}
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Evaluating...</>
              ) : (
                <><Zap size={20} /> Grade Answer</>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-red-400 relative z-10">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </form>

      {/* Results Section */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col gap-6"
        >
          {/* Main Score Card */}
          <div className={`glass-card p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border-2 transition-all ${getScoreColor(result.score, result.max_marks)}`}>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full border-4 border-current flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black">{result.score || 0}</span>
                <span className="text-xs font-bold opacity-70 border-t border-current pt-1 mt-1 w-3/4 text-center">{result.max_marks}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Grade Analysis</h3>
                <p className="text-sm font-medium opacity-90 max-w-xl leading-relaxed">{result.feedback}</p>
              </div>
            </div>
            {result.score / result.max_marks >= 0.8 && <Award size={60} className="opacity-20 shrink-0" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
             {/* Strengths */}
             {result.strengths && result.strengths.length > 0 && (
                <div className="glass-card border border-green-500/20 p-6 rounded-2xl bg-green-500/5">
                   <h4 className="text-lg font-bold text-green-400 flex items-center gap-2 mb-4">
                     <ThumbsUp size={20} /> Strengths
                   </h4>
                   <ul className="space-y-3">
                     {result.strengths.map((str, idx) => (
                       <li key={idx} className="flex items-start gap-3 text-gray-300">
                         <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                         <span className="text-sm leading-relaxed">{str}</span>
                       </li>
                     ))}
                   </ul>
                </div>
             )}

             {/* Areas for Improvement */}
             {result.areas_for_improvement && result.areas_for_improvement.length > 0 && (
                <div className="glass-card border border-yellow-500/20 p-6 rounded-2xl bg-yellow-500/5">
                   <h4 className="text-lg font-bold text-yellow-400 flex items-center gap-2 mb-4">
                     <AlertTriangle size={20} /> Areas for Improvement
                   </h4>
                   <ul className="space-y-3">
                     {result.areas_for_improvement.map((area, idx) => (
                       <li key={idx} className="flex items-start gap-3 text-gray-300">
                         <AlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                         <span className="text-sm leading-relaxed">{area}</span>
                       </li>
                     ))}
                   </ul>
                </div>
             )}
          </div>
          
          {/* Correct Answer Hints */}
          {result.correct_answer_hints && (
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5">
              <h4 className="text-sm uppercase tracking-wider font-bold text-gray-400 mb-3 flex items-center gap-2">
                <Zap size={16} className="text-rose-400" /> Ideal Answer Elements
              </h4>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                {result.correct_answer_hints}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Helper component for icon since lucide might not have exact match
const ThumbtackPlaceholder = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 ${className}`}>
    <path d="M12 2v8"></path>
    <path d="m4.93 10.93 1.41 1.41"></path>
    <path d="M2 18h2"></path>
    <path d="M20 18h2"></path>
    <path d="m19.07 10.93-1.41 1.41"></path>
    <path d="M22 22H2"></path>
    <path d="m8 22 4-10 4 10"></path>
  </svg>
);

export default EvaluateAssignment;
