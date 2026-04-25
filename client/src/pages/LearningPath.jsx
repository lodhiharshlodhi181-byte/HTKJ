import React, { useState } from 'react';
import axios from 'axios';
import { Map, Loader2, BookOpen, Clock, Target, ArrowRight, Book, Route } from 'lucide-react';

const LearningPath = () => {
  const [topic, setTopic] = useState('');
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePath = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setLearningPath(null);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ai/learning-path', {
        topic: topic.trim()
      });
      
      if (res.data.error) {
        setError(res.data.message || res.data.error);
      } else {
        setLearningPath(res.data);
      }
    } catch (err) {
      setError('Failed to generate learning path. Make sure the AI Engine is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 pb-12">
      {/* Header */}
      <div className="w-full">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center gap-3">
          <Route size={32} className="text-purple-400" />
          Personalized Learning Path
        </h1>
        <p className="text-gray-400 mt-2">
          Tell us what you want to learn, and our AI will build a step-by-step roadmap for you.
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-card p-6 border border-white/10 rounded-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <form onSubmit={handleGeneratePath} className="relative z-10 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="e.g., React JS Basics, Quantum Physics, Machine Learning..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all text-lg"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className={`px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              loading || !topic.trim()
                ? 'bg-purple-600/50 text-white/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Map size={20} />
                Generate Roadmap
              </>
            )}
          </button>
        </form>
        {error && (
          <p className="text-red-400 mt-4 text-sm flex items-center gap-2 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            {error}
          </p>
        )}
      </div>

      {/* Roadmap Output */}
      {learningPath && (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
          <div className="glass-card p-8 border border-purple-500/30 rounded-xl bg-purple-500/5">
            <h2 className="text-2xl font-bold text-white mb-2">{learningPath.topic}</h2>
            <p className="text-gray-300 leading-relaxed text-lg">{learningPath.description}</p>
          </div>

          <div className="relative border-l border-purple-500/30 ml-4 md:ml-8 pl-8 space-y-12">
            {learningPath.modules && learningPath.modules.map((mod, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Dot */}
                <span className="absolute -left-[45px] flex items-center justify-center w-10 h-10 bg-black border-2 border-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all group-hover:scale-110 group-hover:bg-purple-900/50">
                  <span className="text-purple-300 font-bold">{idx + 1}</span>
                </span>
                
                {/* Content Card */}
                <div className="glass-card p-6 border border-white/10 rounded-xl group-hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full blur-2xl" />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                        {mod.title}
                      </h3>
                      {mod.estimated_time && (
                        <span className="flex items-center gap-1.5 text-sm font-medium px-3 py-1 bg-white/5 border border-white/10 rounded-full text-indigo-300 whitespace-nowrap">
                          <Clock size={14} />
                          {mod.estimated_time}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {mod.description}
                    </p>
                    
                    {mod.topics && mod.topics.length > 0 && (
                      <div className="bg-black/30 rounded-lg p-5 border border-white/5">
                        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                          <Book size={14} className="text-purple-400" /> Key Topics
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {mod.topics.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                              <Target size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                              <span className="leading-snug">{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="glass-card p-6 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center mt-4">
             <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                 <Target className="text-green-400"/> Keep Learning!
             </h3>
             <p className="text-gray-400 max-w-lg">Follow this roadmap step by step. Complete each module before moving to the next. You've got this!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPath;
