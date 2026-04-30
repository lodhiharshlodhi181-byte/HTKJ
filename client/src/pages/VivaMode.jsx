import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mic, MicOff, Volume2, Play, Square, Loader2 } from 'lucide-react';

const VivaMode = () => {
  const [topic, setTopic] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserSpeech(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    } else {
      alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const handleUserSpeech = async (text) => {
    if (!text.trim()) return;
    
    const newHistory = [...messages, { role: 'user', text }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const aiUrl = import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${aiUrl}/api/ai/viva`, {
        query: text,
        topic: topic,
        history: messages.map(m => ({ role: m.role, text: m.text }))
      });

      const aiText = res.data;
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
      speakText(aiText);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startViva = async () => {
    if (!topic.trim()) return;
    setIsSessionActive(true);
    setMessages([]);
    setIsLoading(true);

    try {
      const aiUrl = import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${aiUrl}/api/ai/viva`, {
        query: "Hello, I am ready to start my viva.",
        topic: topic,
        history: []
      });

      const aiText = res.data;
      setMessages([{ role: 'model', text: aiText }]);
      speakText(aiText);
    } catch (err) {
      console.error(err);
      setMessages([{ role: 'model', text: "Error connecting to AI backend." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const endViva = () => {
    setIsSessionActive(false);
    setMessages([]);
    setTopic('');
    if (synthRef.current) synthRef.current.cancel();
    if (recognitionRef.current) recognitionRef.current.abort();
    setIsListening(false);
  };

  const speakText = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: Choose a specific voice here
    utterance.onend = () => {
      // Auto-start listening after AI finishes speaking, if desired.
      // Keeping it manual for better control to avoid looping noise.
    };
    synthRef.current.speak(utterance);
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (synthRef.current) synthRef.current.cancel(); // Stop AI from speaking if user interrupts
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 uppercase tracking-tight">
          Strict Viva Examiner
        </h1>
        <p className="text-gray-400 font-medium">Practice for your upcoming oral exams with our AI examiner.</p>
      </div>

      {!isSessionActive ? (
        <div className="glass-card p-10 flex flex-col items-center justify-center border border-white/10 max-w-lg mx-auto">
          <Volume2 size={60} className="text-orange-400 mb-6" />
          <h3 className="text-xl font-bold mb-4">Enter Viva Topic</h3>
          <input 
            type="text" 
            placeholder="e.g. Operating Systems, Data Structures..." 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 mb-6 text-center text-white"
          />
          <button 
            onClick={startViva}
            disabled={!topic.trim() || isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex justify-center items-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={20} />}
            Start Mock Viva
          </button>
        </div>
      ) : (
        <div className="glass-card p-8 flex flex-col items-center relative border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.1)]">
          <button 
            onClick={endViva}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-400 flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg text-sm"
          >
            <Square size={14} fill="currentColor" /> End Viva
          </button>
          
          <div className="w-full max-w-2xl mt-8 mb-12 space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'}`}>
                  <p className="text-sm font-medium">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl bg-white/5 text-gray-400 rounded-bl-none border border-white/5">
                  <Loader2 className="animate-spin" size={20} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <button 
              onClick={toggleListen}
              disabled={isLoading}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                isListening 
                  ? 'bg-red-500 animate-pulse shadow-[0_0_50px_rgba(239,68,68,0.6)] scale-110' 
                  : 'bg-white/10 border border-white/20 hover:bg-white/20 hover:border-orange-500/50'
              } disabled:opacity-50`}
            >
              {isListening ? <Mic size={40} className="text-white" /> : <MicOff size={40} className="text-gray-400" />}
            </button>
            <p className={`mt-6 font-bold tracking-widest uppercase text-sm ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-500'}`}>
              {isListening ? 'Listening... Speak Now' : 'Tap Mic to Answer'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VivaMode;
