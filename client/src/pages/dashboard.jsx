import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { getDashboardStats } from '../assets/services/userAPI';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userDataStr = localStorage.getItem("user");
    if (!localStorage.getItem("token") || !userDataStr) {
      navigate('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userDataStr));
    } catch(e) {
      console.warn("Invalid user data in local storage");
    }

    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Dashboard API Error:", err);
        setError("Failed to load real-time analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h2 className="text-xl text-red-500 mb-4">{error}</h2>
        <button onClick={() => window.location.reload()} className="bg-purple-600 px-4 py-2 rounded-lg text-white">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'Student'}!
        </h1>
        <p className="text-gray-400">Here's your real-time learning overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<FileText />} label="PYQs Analyzed" value={stats?.totalPapers || "0"} color="from-blue-500 to-cyan-500" />
        <StatCard icon={<BookOpen />} label="Quizzes Taken" value={stats?.totalQuizzes || "0"} color="from-purple-500 to-pink-500" />
        <StatCard icon={<AlertTriangle />} label="Weak Topics" value={stats?.numWeakTopics || "0"} color="from-orange-500 to-red-500" />
        <StatCard icon={<TrendingUp />} label="Avg Score" value={`${stats?.avgScore || "0"}%`} color="from-green-500 to-emerald-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-6 h-64 flex flex-col overflow-hidden">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-400" /> Focus Areas
          </h3>
          <div className="flex-1 space-y-3 mt-2 overflow-y-auto pr-2">
            {stats?.focusAreas && stats.focusAreas.length > 0 ? (
              stats.focusAreas.map((focus, idx) => (
                 <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-lg flex justify-between items-center group hover:border-purple-500/50 transition-colors">
                  <span className="font-medium text-gray-200">{focus.topic}</span>
                  <span className="text-red-400 text-sm bg-red-400/10 px-2 py-1 rounded-md">{focus.count} Misses</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center italic mt-10">You have no weak topics yet. Excellent job!</p>
            )}
          </div>
          <Link to="/quiz" className="text-sm text-purple-400 hover:text-purple-300 mt-4 self-end flex items-center gap-1 group">
            Generate specific quiz <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="glass-card p-6 h-64 flex flex-col overflow-hidden">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="text-blue-400" /> Recent Activities
          </h3>
          <div className="flex-1 overflow-y-auto pr-2">
            <ul className="space-y-4">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((act, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm group">
                    <span className={`w-2 h-2 rounded-full ${act.type === 'quiz' ? 'bg-purple-500' : 'bg-blue-500'} group-hover:scale-150 transition-transform`}></span>
                    <span className="flex-1 text-gray-200 truncate">{act.title}</span>
                    <span className="text-gray-500 text-xs whitespace-nowrap">{new Date(act.createdAt).toLocaleDateString()}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-center italic mt-10">No recent activities available.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-card p-6 relative overflow-hidden group hover:border-white/20 transition-all cursor-default">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-bl-full -mr-8 -mt-8 scale-0 group-hover:scale-100 transition-transform duration-500`}></div>
    <div className={`text-white/50 mb-4 inline-block`}>{icon}</div>
    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r text-white">{value}</div>
    <div className="text-sm text-gray-400 mt-1">{label}</div>
  </div>
);

export default Dashboard;