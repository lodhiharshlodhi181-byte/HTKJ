import React, { useState } from 'react';
import { UploadCloud, FileText, ChevronRight, Activity, FileStack, BookOpen, Star, X } from 'lucide-react';
import axios from 'axios';

const UploadPaper = () => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
    // reset input so the same file could be selected again if it was removed
    if (e.target) e.target.value = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === "application/pdf" || file.name.endsWith(".pdf"));
      setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    
    const formData = new FormData();
    // Append multiple files to the 'files' field mapped in FastAPI
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    try {
      const aiUrl = import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${aiUrl}/api/ai/analyze-paper`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAnalysisResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Error analyzing paper. Make sure Python AI backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 italic uppercase">
          PYQ Analyzer & Generator
        </h1>
        <p className="text-gray-400 font-medium">Upload multiple past year question papers to extract trends and auto-generate an Expected Subject Paper.</p>
      </div>

      <div 
        className="glass-card p-10 flex flex-col items-center justify-center border-dashed border-2 border-white/20 hover:border-purple-500/50 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadCloud size={60} className="text-purple-400 mb-4" />
        <h3 className="text-xl font-bold mb-1">Drag & Drop your PDFs here</h3>
        <p className="text-sm text-gray-500 mb-6">Select 2 or more previous papers for best results.</p>
        
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept=".pdf"
          multiple
          onChange={handleFileChange}
        />
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full font-bold transition-colors border border-white/10"
        >
          Browse Files
        </label>
        
        {files.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3 justify-center max-w-lg">
            {files.map((f, i) => (
              <span key={i} className="bg-purple-500/20 border border-purple-500/40 px-3 py-1 rounded-md text-sm flex items-center gap-2">
                <FileStack size={14} className="text-purple-300"/> 
                {f.name}
                <button 
                  onClick={() => removeFile(i)} 
                  className="ml-1 text-purple-300 hover:text-red-400 focus:outline-none"
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-8 w-full max-w-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_25px_rgba(219,39,119,0.5)] py-4 rounded-full font-black uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {isUploading ? 'Analyzing PDFs...' : 'Generate Expected Paper'}
          </button>
        )}
      </div>

      {analysisResult && analysisResult.mockPaper && (
        <div className="space-y-6 mt-8 animate-fade-in border-t border-white/10 pt-8">
          
          <div className="glass-card p-8 bg-gradient-to-br from-purple-900/40 to-pink-900/20 border border-pink-500/30">
            <div className="flex items-center gap-3 mb-6">
              <Star className="text-pink-400 fill-pink-400" size={28}/>
              <h2 className="text-2xl font-black text-pink-300 uppercase">Trend Analysis Report</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm text-gray-400 uppercase font-bold tracking-widest mb-3">Analyzed Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.filenames?.map((name, i) => (
                    <span key={i} className="text-xs bg-black/40 px-3 py-1.5 rounded-full border border-white/10">{name}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm text-gray-400 uppercase font-bold tracking-widest mb-3">Expected Hot Topics</h4>
                <div className="space-y-2">
                  {analysisResult.expectedTopics?.map((topic, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-pink-500/10 px-3 py-2 rounded-lg border border-pink-500/20">
                      <div className="flex items-start gap-2">
                        <ChevronRight size={16} className="text-pink-400 mt-0.5 shrink-0"/>
                        <span className="font-semibold text-pink-100">{topic}</span>
                      </div>
                      <a 
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " tutorial")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-red-600/80 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap self-start sm:self-auto border border-red-500/50"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        Watch Video
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-0 overflow-hidden relative border border-white/10 mock-paper-container">
            <div className="bg-white text-black p-8 md:p-12 font-serif relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 print:hidden"></div>
              
              <div className="text-center mb-10 border-b-2 border-black/10 pb-6">
                <h2 className="text-3xl font-black tracking-widest uppercase mb-2">Mock Test Paper</h2>
                <h3 className="text-lg font-bold text-gray-600 italic">Expected Question Paper 2026</h3>
                <div className="flex justify-between text-sm font-bold mt-6 text-gray-500">
                  <span>TIME: 3 HOURS</span>
                  <span>MAX MARKS: {analysisResult.mockPaper?.reduce((acc, curr) => acc + (curr.marks || 0), 0) || 100}</span>
                </div>
              </div>

              <div className="space-y-8 pl-4 pr-2">
                {analysisResult.mockPaper?.map((q, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="font-bold text-lg w-8 shrink-0">Q{i+1}.</div>
                    <div className="flex-1 text-lg">
                      {q.questionText}
                    </div>
                    <div className="font-bold whitespace-nowrap text-right w-16">
                      [{q.marks} Marks]
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 text-center text-xs font-bold tracking-widest text-gray-400 border-t border-black/10 pt-4">
                END OF QUESTION PAPER • AI AUTOMATED GENERATION
              </div>
              
              <div className="mt-8 flex justify-center pb-4 print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full shadow-lg border border-gray-700 transition flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download As PDF
                </button>
              </div>
              
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  .mock-paper-container, .mock-paper-container * { visibility: visible; }
                  .mock-paper-container { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
                }
              `}</style>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default UploadPaper;