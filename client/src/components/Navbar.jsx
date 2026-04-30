import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, MessageSquare, BookOpen, Upload, PieChart, Sun, Moon, Map, FileText, Award, Users, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api$/, '');

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [theme, setTheme] = React.useState('dark');
  const [onlineCount, setOnlineCount] = React.useState(0);
  const [onlineUsersList, setOnlineUsersList] = React.useState([]);
  const [showOnlineUsers, setShowOnlineUsers] = React.useState(false);

  React.useEffect(() => {
    const newSocket = io(socketUrl);
    
    // Register the user if logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      newSocket.emit('registerUser', JSON.parse(userData).name);
    }

    newSocket.on('onlineUsersCount', (count) => {
      setOnlineCount(count);
    });

    newSocket.on('onlineUsersList', (list) => {
      // Remove duplicates and filter empty
      const uniqueNames = [...new Set(list.filter(n => n))];
      setOnlineUsersList(uniqueNames);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user");
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Path', path: '/learning-path', icon: <Map size={18} /> },
    { name: 'Notes', path: '/notes', icon: <FileText size={18} /> },
    { name: 'Evaluate', path: '/evaluate', icon: <Award size={18} /> },
    { name: 'AI Tutor', path: '/chat', icon: <MessageSquare size={18} /> },
    { name: 'Peers', path: '/matchmaking', icon: <Users size={18} /> },
    { name: 'Revision', path: '/srs', icon: <RefreshCw size={18} /> },
    { name: 'Quizzes', path: '/quiz', icon: <BookOpen size={18} /> },
    { name: 'Viva', path: '/viva', icon: <MessageSquare size={18} /> },
    { name: 'PYQ Upload', path: '/upload', icon: <Upload size={18} /> },
    { name: 'Analytics', path: '/analytics', icon: <PieChart size={18} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-card border-b border-white/10 px-6 py-4 rounded-none rounded-b-xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 brand-font tracking-wide">
          <Sparkles className="text-purple-400" />
          <span>CognifyED</span>
        </Link>
        <div className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                location.pathname === link.path 
                  ? 'bg-purple-500/20 text-purple-300 neon-border-glow' 
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
              }`}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-gray-100 hover:bg-white/10 transition-all flex items-center justify-center neon-border-glow cursor-pointer"
            title="Toggle Light/Dark Mode"
          >
            {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
          </button>
          
          {/* Online Counter UI */}
          <div className="relative">
            <div 
              onClick={() => setShowOnlineUsers(!showOnlineUsers)}
              className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 cursor-pointer border border-green-500/20 px-3 py-1.5 rounded-full transition-colors" 
              title="Students Online"
            >
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </div>
              <span className="text-sm font-bold text-green-400">{onlineCount}</span>
            </div>
            
            {/* Dropdown for Online Users */}
            {showOnlineUsers && (
              <div className="absolute top-12 right-0 w-48 bg-black/90 border border-green-500/30 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.2)] py-2 z-[100] animate-fade-in backdrop-blur-md">
                <div className="px-4 py-2 border-b border-white/10 mb-2">
                  <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Online Now</span>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {onlineUsersList.map((name, i) => (
                    <div key={i} className="px-4 py-1.5 flex items-center gap-2 text-sm text-gray-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span className="truncate">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div 
              onClick={handleLogout}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer hover:from-purple-600 hover:to-indigo-700 transition"
              title="Logout"
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          ) : (
            <Link to="/login" className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 px-5 py-2 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
