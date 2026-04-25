import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Loader2, Download, Copy, Check, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const StudyNotes = () => {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateNotes = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setNotes(null);
    setCopied(false);

    try {
      const aiUrl = import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${aiUrl}/api/ai/notes`, {
        topic: topic.trim()
      });
      
      if (res.data.error) {
        setError(res.data.message || res.data.error);
      } else {
        setNotes(res.data.notes);
      }
    } catch (err) {
      setError('Failed to generate notes. Make sure the AI Engine is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (notes) {
      navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (notes) {
      const blob = new Blob([notes], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${topic.replace(/\s+/g, '_')}_notes.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 pb-12">
      {/* Header */}
      <div className="w-full">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500 flex items-center gap-3">
          <BookOpen size={32} className="text-green-400" />
          AI Study Notes
        </h1>
        <p className="text-gray-400 mt-2">
          Generate comprehensive, structured markdown notes for any topic instantly.
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-card p-6 border border-white/10 rounded-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <form onSubmit={handleGenerateNotes} className="relative z-10 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="What do you want notes on? e.g., Photosynthesis, System Design..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all text-lg"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className={`px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              loading || !topic.trim()
                ? 'bg-green-600/50 text-white/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Drafting...
              </>
            ) : (
              <>
                <FileText size={20} />
                Generate Notes
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

      {/* Notes Output */}
      {notes && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-700">
          <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
               <FileText size={18} className="text-green-400" />
               Generated Notes
            </h2>
            <div className="flex gap-3">
               <button 
                 onClick={handleCopy}
                 className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all"
               >
                 {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                 {copied ? 'Copied' : 'Copy'}
               </button>
               <button 
                 onClick={handleDownload}
                 className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded-lg text-sm font-medium transition-all"
               >
                 <Download size={16} />
                 Download .md
               </button>
            </div>
          </div>

          <div className="glass-card p-6 md:p-10 border border-white/10 rounded-xl prose prose-invert prose-green max-w-none">
             <ReactMarkdown>{notes}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyNotes;
