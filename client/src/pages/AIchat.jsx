import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Bot, Globe, Volume2, VolumeX, PlayCircle } from 'lucide-react';
import axios from 'axios';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI Tutor. What would you like to learn today?' }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev ? prev + ' ' + transcript : transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      const langMap = {
        'English': 'en-US',
        'Hindi': 'hi-IN',
        'Bengali': 'bn-IN',
        'Gujarati': 'gu-IN',
        'Marathi': 'mr-IN'
      };
      recognitionRef.current.lang = langMap[language] || 'en-US';
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speakText = (text, lang, idx = null) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const langMap = {
        'English': 'en-US',
        'Hindi': 'hi-IN',
        'Bengali': 'bn-IN',
        'Gujarati': 'gu-IN',
        'Marathi': 'mr-IN'
      };
      const bcpToUse = langMap[lang] || 'en-US';
      utterance.lang = bcpToUse;

      // Ensure we pick a voice that actually supports the language
      const voices = window.speechSynthesis.getVoices();
      // Try exact match, e.g. hi-IN
      let targetVoice = voices.find(v => v.lang === bcpToUse);
      // Fallback to broad language code e.g. hi
      if (!targetVoice) {
         targetVoice = voices.find(v => v.lang.startsWith(bcpToUse.split('-')[0]));
      }
      if (targetVoice) {
         utterance.voice = targetVoice;
      }
      
      utterance.onstart = () => {
         if (idx !== null) setSpeakingIdx(idx);
      };
      utterance.onend = () => {
         setSpeakingIdx(null);
      };
      utterance.onerror = () => {
         setSpeakingIdx(null);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setMessages(prev => [...prev, { role: 'ai', content: '...' }]); // Loading placeholder

    try {
      // Connects to our Python Service or Node Service that forwards to Python
      const aiUrl = import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${aiUrl}/api/ai/doubt`, {
        query: userMsg,
        language: language
      });
      
      const cleanAnswer = res.data.answer.replace(/[*_#]/g, '');

      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'ai', content: cleanAnswer };
        return newMsgs;
      });
      
      if (voiceEnabled) {
        speakText(cleanAnswer, language, messages.length); // messages.length will be the index of the newly added ai message
      }
    } catch (err) {
      const errorMsg = 'Sorry, the AI service is unavailable right now.';
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'ai', content: errorMsg };
        return newMsgs;
      });
      if (voiceEnabled) {
         speakText(errorMsg, 'English', messages.length);
      }
    }
  };

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition API is not supported in your browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[550px] max-h-[80vh] glass-card flex flex-col overflow-hidden animate-fade-in pointer-events-auto shadow-2xl border border-purple-500/30">
          {/* Header */}
          <div className="border-b border-white/10 p-3 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-full border border-purple-500/50">
                <Bot size={20} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">AI Tutor</h2>
                <p className="text-[10px] text-green-400 flex items-center gap-1 uppercase tracking-wider font-semibold">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled) window.speechSynthesis.cancel();
                }}
                className={`flex items-center justify-center p-1.5 rounded-md border transition-all ${voiceEnabled ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                title="Toggle Voice Output"
              >
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              
              <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md border border-white/10">
                <Globe size={12} className="text-gray-400"/>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer w-16"
                >
                  <option className="bg-[#030014]">English</option>
                  <option className="bg-[#030014]">Hindi</option>
                  <option className="bg-[#030014]">Bengali</option>
                  <option className="bg-[#030014]">Gujarati</option>
                  <option className="bg-[#030014]">Marathi</option>
                </select>
              </div>
              
              {/* Close Button for inner window */}
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors ml-1">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 flex gap-2 ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 border border-purple-500/50 text-white rounded-br-none' 
                    : 'bg-white/10 border border-white/10 text-gray-200 rounded-bl-none shadow-lg backdrop-blur-sm'
                }`}>
                  {msg.role === 'ai' && <Bot size={16} className="mt-1 flex-shrink-0 text-purple-400" />}
                  <div className="flex flex-col gap-1 w-full">
                     <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                     {msg.role === 'ai' && msg.content !== '...' && (
                       <div className="flex justify-start mt-1">
                         <button 
                           onClick={() => speakText(msg.content, language, idx)}
                           className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors ${speakingIdx === idx ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-black/20 text-gray-400 hover:bg-black/40 hover:text-gray-200'}`}
                         >
                           <PlayCircle size={10} className={speakingIdx === idx ? "animate-pulse text-purple-400" : ""} />
                           {speakingIdx === idx ? "Speaking..." : "Listen"}
                         </button>
                       </div>
                     )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-black/60 border-t border-white/10 backdrop-blur-md">
            <form onSubmit={handleSend} className="flex items-center gap-2 relative">
              <button 
                type="button" 
                onClick={toggleListen}
                className={`p-2.5 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-500 neon-border-glow' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                <Mic size={18} />
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your doubt..."
                className="flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              
              <button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-full transition-all flex items-center justify-center hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <div className="relative">
            <Bot size={28} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#030014] rounded-full animate-bounce"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default AIChat;