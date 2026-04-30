import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Sparkles, CheckCircle2, AlertCircle, Clock, Users, UserPlus, Play } from 'lucide-react';
import { submitQuizResult } from '../assets/services/userAPI';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api$/, '');
const socket = io(socketUrl, { autoConnect: false });

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
  
  // Strict Exam Mode State
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");
  
  // Group Quiz State
  const [quizMode, setQuizMode] = useState('solo'); // 'solo', 'group_setup', 'group_lobby'
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [roomState, setRoomState] = useState(null); // 'waiting', 'playing', 'finished'
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [playerName, setPlayerName] = useState('');
  
  const [groupAction, setGroupAction] = useState('create'); // 'create' or 'join'
  const [activeRooms, setActiveRooms] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Attempt to get user name from local storage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setPlayerName(user.name || 'Guest_' + Math.floor(Math.random() * 1000));
      } catch (e) {
        setPlayerName('Guest_' + Math.floor(Math.random() * 1000));
      }
    } else {
      setPlayerName('Guest_' + Math.floor(Math.random() * 1000));
    }

    socket.connect();

    socket.on('roomUpdated', (room) => {
      setPlayers(room.players);
      setRoomState(room.state);
      setQuizData(room.quizData);
    });

    socket.on('quizStarted', (questions) => {
      setRoomState('playing');
      setQuizData(questions);
      if (parseInt(timerMinutes) > 0) {
        setTimeLeft(parseInt(timerMinutes) * 60);
      } else {
        setTimeLeft(null); // Ensure timer is handled for group if needed
      }
    });

    socket.on('leaderboardUpdated', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('activeRooms', (roomsList) => {
      setActiveRooms(roomsList);
    });

    socket.emit('getActiveRooms');

    socket.on('error', (msg) => {
      alert(msg);
      setQuizMode('group_setup');
    });

    return () => {
      socket.off('roomUpdated');
      socket.off('quizStarted');
      socket.off('leaderboardUpdated');
      socket.off('activeRooms');
      socket.off('error');
      socket.disconnect();
    };
  }, []);

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

  // Anti-Cheat Listeners
  useEffect(() => {
    if (!isStrictMode || isSubmitted || !quizData || roomState !== 'playing' && quizMode !== 'solo') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("You switched tabs or minimized the window!");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation("You exited full-screen mode!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isStrictMode, isSubmitted, quizData, roomState, quizMode]);

  const handleViolation = (msg) => {
    setViolationCount(prev => {
      const newCount = prev + 1;
      setViolationMessage(`${msg} This is warning ${newCount} of 2. Focus on the test!`);
      setShowViolationModal(true);
      
      if (newCount >= 2) {
        setTimeout(() => {
          handleSubmit();
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log(err));
          }
        }, 3000);
      }
      return newCount;
    });
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleGenerate = async (isGroup = false) => {
    if (!topic) return;
    setIsGenerating(true);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setFinalScore(null);

    try {
      const aiUrl = import.meta.env.VITE_AI_URL || 'http://127.0.0.1:8000';
      const res = await axios.post(`${aiUrl}/api/ai/quiz`, {
        topic,
        difficulty,
        num_questions: parseInt(numQuestions)
      });
      
      if (res.data.error) {
        alert("AI Error: " + res.data.error);
        return;
      }

      const newQuizData = res.data;
      setQuizData(newQuizData);
      
      if (isGroup) {
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomId(newRoomId);
        setIsHost(true);
        socket.emit('createRoom', { roomId: newRoomId, quizData: newQuizData, hostName: playerName });
        setQuizMode('group_lobby');
        setRoomState('waiting');
      } else {
        if (parseInt(timerMinutes) > 0) {
          setTimeLeft(parseInt(timerMinutes) * 60);
        } else {
          setTimeLeft(null);
        }
        if (isStrictMode) {
          try {
            document.documentElement.requestFullscreen();
          } catch(err) {
            console.log(err);
          }
        }
      }
    } catch (err) {
      alert('Error generating quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoinGroup = (code) => {
    const targetRoomId = code || joinRoomId.trim().toUpperCase();
    if (!targetRoomId) return;
    socket.emit('joinRoom', { roomId: targetRoomId, playerName });
    setRoomId(targetRoomId);
    setIsHost(false);
    setQuizMode('group_lobby');
    setRoomState('waiting');
  };

  const handleStartGroupQuiz = () => {
    if (isHost) {
      socket.emit('startQuiz', roomId);
    }
  };

  useEffect(() => {
    if (roomState === 'playing' && isStrictMode) {
      try {
        document.documentElement.requestFullscreen();
      } catch(err) {
        console.log(err);
      }
    }
  }, [roomState, isStrictMode]);

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
      let currentScore = 0;
      quizData.forEach((q, idx) => {
        if (selectedAnswers[idx]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()) {
          currentScore++;
        }
      });
      
      setFinalScore(currentScore);
      setIsSubmitted(true);

      const payload = {
        topic: topic || "Group Quiz",
        difficulty: difficulty || "mixed",
        questions: quizData,
        selectedAnswers
      };
      await submitQuizResult(payload);

      if (quizMode !== 'solo') {
        // Group Quiz socket update
        socket.emit('submitScore', { roomId, score: currentScore, answers: selectedAnswers });
        setRoomState('finished');
      }
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
      
    } catch (err) {
      console.error("DEBUG SUBMIT ERROR:", err.response?.data || err.message);
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

  // Render group lobby
  if (quizMode === 'group_lobby' && roomState === 'waiting') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">
        <div className="glass-card p-8 text-center space-y-6">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            Waiting Lobby
          </h2>
          <div className="p-6 bg-black/40 rounded-xl border border-purple-500/30 inline-block">
            <p className="text-gray-400 uppercase tracking-widest text-sm font-bold mb-2">Room Code</p>
            <p className="text-5xl font-mono text-white tracking-widest">{roomId}</p>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-200">Players Joined ({players.length})</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {players.map((p, i) => (
                <div key={i} className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center gap-2">
                  <Users size={16} className="text-purple-400"/>
                  <span className="text-purple-100 font-medium">{p.name} {p.id === socket.id ? '(You)' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            {isHost ? (
              <button 
                onClick={handleStartGroupQuiz}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all w-full md:w-auto mx-auto shadow-lg shadow-green-500/20 text-lg"
              >
                <Play fill="currentColor" size={20}/> Start Quiz Now
              </button>
            ) : (
              <p className="text-gray-400 animate-pulse">Waiting for host to start the quiz...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Violation Modal */}
      {showViolationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-red-950/80 border-2 border-red-500 p-8 rounded-2xl max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-bounce-short">
            <AlertCircle size={60} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-red-400 mb-2">WARNING {violationCount}/2</h2>
            <p className="text-white mb-6 text-lg">{violationMessage}</p>
            {violationCount < 2 ? (
              <button 
                onClick={() => {
                  setShowViolationModal(false);
                  if (isStrictMode && !document.fullscreenElement) {
                     document.documentElement.requestFullscreen().catch(e=>console.log(e));
                  }
                }}
                className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold transition-all w-full"
              >
                Return to Exam
              </button>
            ) : (
              <p className="text-red-300 font-bold animate-pulse">Auto-submitting your exam...</p>
            )}
          </div>
        </div>
      )}

      {/* Setup Phase */}
      {!isSubmitted && roomState !== 'playing' && quizMode !== 'group_lobby' && (
        <div className="glass-card p-8 text-center space-y-6 relative overflow-hidden">
          
          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-black/40 p-1 rounded-full border border-white/10 flex">
              <button 
                onClick={() => setQuizMode('solo')}
                className={`px-6 py-2 rounded-full font-bold transition-all ${quizMode === 'solo' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Solo Practice
              </button>
              <button 
                onClick={() => setQuizMode('group_setup')}
                className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${quizMode === 'group_setup' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                <Users size={18} /> Group Quiz
              </button>
            </div>
          </div>

          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
            {quizMode === 'solo' ? 'AI Quiz Generator' : 'Multiplayer Quiz Setup'}
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            {quizMode === 'solo' 
              ? 'Enter a topic you want to test yourself on, and our AI will generate a customized quiz.' 
              : 'Host a room and challenge your friends in real-time, or join an existing room.'}
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center max-w-3xl mx-auto mt-6">
            
            {/* If Group Mode, show Create/Join toggles */}
            {quizMode === 'group_setup' && (
              <div className="w-full flex justify-center mb-4 gap-4">
                <button 
                  onClick={() => setGroupAction('create')}
                  className={`px-6 py-2 rounded-xl font-bold transition-all ${groupAction === 'create' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'}`}
                >
                  Create Room
                </button>
                <button 
                  onClick={() => { setGroupAction('join'); socket.emit('getActiveRooms'); }}
                  className={`px-6 py-2 rounded-xl font-bold transition-all ${groupAction === 'join' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'}`}
                >
                  Join Room
                </button>
              </div>
            )}

            {/* Join Room UI */}
            {quizMode === 'group_setup' && groupAction === 'join' && (
              <div className="w-full max-w-md mx-auto p-6 border border-white/10 bg-white/5 rounded-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-center gap-2">
                  <UserPlus size={20} className="text-blue-400"/> Join by Code
                </h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Code" 
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white font-mono tracking-widest text-center uppercase"
                  />
                  <button 
                    onClick={() => handleJoinGroup()}
                    disabled={!joinRoomId.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
                
                <div className="my-6 flex items-center text-gray-500">
                  <div className="flex-1 border-t border-white/10"></div>
                  <span className="px-4 text-sm font-medium">OR</span>
                  <div className="flex-1 border-t border-white/10"></div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-md font-bold text-gray-300 text-left mb-2">Active Public Rooms</h4>
                  {activeRooms.length === 0 ? (
                    <div className="p-4 rounded-lg bg-black/20 border border-white/5 text-gray-400 text-center italic">
                      No active group quiz
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {activeRooms.map((room) => (
                        <div key={room.roomId} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors">
                          <div className="text-left">
                            <p className="font-bold text-white text-sm">Host: {room.hostName}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1"><Users size={12}/> {room.playerCount} waiting</p>
                          </div>
                          <button 
                            onClick={() => handleJoinGroup(room.roomId)}
                            className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-all"
                          >
                            Join
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Create Room / Solo UI */}
            {(quizMode === 'solo' || (quizMode === 'group_setup' && groupAction === 'create')) && (
              <div className={`w-full flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center ${quizMode === 'group_setup' ? 'max-w-md mx-auto p-6 border border-white/10 bg-white/5 rounded-2xl animate-fade-in' : ''}`}>
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
                
                {quizMode === 'solo' && (
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
                )}

                {quizMode === 'solo' && (
                  <label className="flex items-center gap-2 cursor-pointer bg-black/30 border border-white/10 px-4 py-3 rounded-lg text-red-400 hover:bg-white/5 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={isStrictMode} 
                      onChange={(e) => setIsStrictMode(e.target.checked)}
                      className="accent-red-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-sm">Strict Exam Mode</span>
                  </label>
                )}

                <button 
                  onClick={() => handleGenerate(quizMode === 'group_setup')}
                  disabled={isGenerating || !topic.trim()}
                  className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all w-full sm:w-auto disabled:opacity-50 mt-2 sm:mt-0 ${quizMode === 'group_setup' ? 'w-full' : ''}`}
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                  {isGenerating ? 'Generating...' : (quizMode === 'solo' ? 'Generate AI Quiz' : 'Create Room')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Solo Quiz Results */}
      {isSubmitted && quizMode === 'solo' && finalScore !== null && Object.keys(quizData || {}).length > 0 && (
        <div className="glass-card p-8 text-center space-y-6 border border-purple-500/50 bg-purple-500/5 shadow-[0_0_30px_rgba(168,85,247,0.15)] animate-fade-in">
          <div>
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
              Quiz Complete!
            </h2>
            <p className="text-xl text-gray-300 mt-2">
              You scored <strong className="text-3xl text-white outline-2 px-2">{finalScore}</strong> out of <strong className="text-3xl text-white">{quizData.length}</strong>
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center">
              <span className="text-3xl font-black text-blue-400">{Object.keys(selectedAnswers).length}</span>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-bold mt-1">Attempted</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center">
              <span className="text-3xl font-black text-gray-400">{quizData.length - Object.keys(selectedAnswers).length}</span>
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold mt-1">Skipped</span>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col items-center">
              <span className="text-3xl font-black text-green-400">{finalScore}</span>
              <span className="text-xs uppercase tracking-wider text-green-500 font-bold mt-1">Correct</span>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col items-center">
              <span className="text-3xl font-black text-red-500">{Math.max(0, Object.keys(selectedAnswers).length - finalScore)}</span>
              <span className="text-xs uppercase tracking-wider text-red-400 font-bold mt-1">Wrong</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-6">
            <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-bold transition">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Group Quiz Leaderboard */}
      {isSubmitted && quizMode !== 'solo' && (
        <div className="glass-card p-8 space-y-8 border border-blue-500/50 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.15)] animate-fade-in">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
              Leaderboard
            </h2>
            <p className="text-gray-400">Waiting for others to finish...</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {[...players].sort((a, b) => b.score - a.score).map((p, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${p.id === socket.id ? 'bg-amber-500/20 border-amber-500/50' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${i === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-400'}`}>
                    {i + 1}
                  </div>
                  <span className="font-bold text-lg text-white">{p.name} {p.id === socket.id ? '(You)' : ''}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">{p.score}</span>
                  <span className="text-sm text-gray-400 ml-1">pts</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-4 justify-center pt-6">
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-bold transition">
              Exit Group
            </button>
          </div>
        </div>
      )}

      {/* Quiz Questions */}
      {quizData && (roomState === 'playing' || (quizMode === 'solo' && !isSubmitted)) && (
        <div className="space-y-6 animate-fade-in">
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
                disabled={isSubmitting}
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