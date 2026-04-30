import React, { useState, useEffect, useRef } from 'react';
import { Users, Search, MessageCircle, X, Send, Loader2, Target, Zap } from 'lucide-react';
import { getStudyBuddies } from '../assets/services/userAPI';
import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api$/, '');

const Matchmaking = () => {
  const [buddies, setBuddies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null); // stores the buddy object
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [socket, setSocket] = useState(null);
  
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let parsedUser = null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      parsedUser = JSON.parse(userStr);
      setCurrentUser(parsedUser);
    }

    setLoading(false); // No API call needed anymore

    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('chatMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    newSocket.on('onlineUsersList', (list) => {
      // Filter out the current user so they don't see themselves
      if (parsedUser) {
        const others = list.filter(u => u._id !== parsedUser._id);
        setBuddies(others);
      } else {
        setBuddies(list);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openChat = (buddy) => {
    setActiveChat(buddy);
    setMessages([]); // Clear previous messages
    
    // Create a unique deterministic room ID based on both user IDs
    const myId = currentUser?._id || 'unknown';
    const roomIds = [myId, buddy._id].sort();
    const chatRoomId = `chat_${roomIds[0]}_${roomIds[1]}`;
    
    socket.emit('joinChat', chatRoomId);
  };

  const closeChat = () => {
    if (activeChat) {
      const myId = currentUser?._id || 'unknown';
      const roomIds = [myId, activeChat._id].sort();
      const chatRoomId = `chat_${roomIds[0]}_${roomIds[1]}`;
      socket.emit('leaveChat', chatRoomId);
    }
    setActiveChat(null);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    const myId = currentUser?._id || 'unknown';
    const roomIds = [myId, activeChat._id].sort();
    const chatRoomId = `chat_${roomIds[0]}_${roomIds[1]}`;

    socket.emit('chatMessage', {
      chatRoomId,
      senderName: currentUser?.name || 'Me',
      text: messageInput
    });

    setMessageInput("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16 relative">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 uppercase tracking-tight">
          AI Study Buddy Matchmaker
        </h1>
        <p className="text-gray-400 font-medium max-w-2xl mx-auto">
          We found students whose strengths complement your weaknesses. Connect with them and learn together!
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : buddies.length === 0 ? (
        <div className="glass-card p-12 text-center border border-white/5">
          <Search size={60} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-300">No matches found right now</h3>
          <p className="text-gray-500 mt-2">Complete more quizzes to build your learning profile and find better matches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buddies.map(buddy => (
            <div key={buddy._id} className="glass-card p-6 border border-white/10 hover:border-blue-500/50 transition-all group relative">
              
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Live</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg shrink-0">
                  {buddy.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-100 pr-12">{buddy.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><Target size={12} /> {buddy.skills?.length || 0} Skills</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-wider text-green-400 font-bold mb-2 flex items-center gap-1"><Zap size={14}/> Top Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {buddy.skills && buddy.skills.length > 0 ? (
                      buddy.skills.slice(0, 3).map((t, i) => (
                        <span key={i} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-md border border-green-500/30">{t}</span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500 italic">No skills listed</span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => openChat(buddy)}
                className="w-full bg-white/10 hover:bg-blue-600 text-white py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} /> Connect via Chat
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floating Chat Window */}
      {activeChat && (
        <div className="fixed bottom-0 right-4 md:right-10 w-full max-w-sm glass-card border border-white/20 rounded-t-2xl rounded-b-none shadow-2xl z-50 flex flex-col h-[500px] animate-slide-up bg-[#0f0f1a]">
          <div className="flex justify-between items-center p-4 border-b border-white/10 bg-blue-600/20 rounded-t-2xl">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">
                  {activeChat.name.charAt(0).toUpperCase()}
                </div>
              <h3 className="font-bold text-white">{activeChat.name}</h3>
            </div>
            <button onClick={closeChat} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 italic mt-10">
                Say hi to {activeChat.name}! They can help you with {activeChat.skills?.[0] || 'your studies'}.
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.senderName === currentUser?.name;
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/10 text-gray-200 rounded-bl-none'}`}>
                      {!isMe && <p className="text-xs text-blue-300 mb-1 font-bold">{msg.senderName}</p>}
                      <p className="text-sm break-words">{msg.text}</p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 border-t border-white/10 flex gap-2 bg-black/40">
            <input 
              type="text" 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 text-sm text-white"
            />
            <button 
              type="submit"
              disabled={!messageInput.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Matchmaking;
