import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, AlertTriangle, FileText, Loader2, Activity } from 'lucide-react';
import { getDashboardStats, getAnalyticsData } from '../assets/services/userAPI';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
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

    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          getDashboardStats(),
          getAnalyticsData()
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error("Dashboard API Error:", err);
        setError("Failed to load real-time analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'rgba(255, 255, 255, 0.7)' }
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      }
    }
  };

  const chartData = {
    labels: analytics?.labels || ['Week 1', 'Week 2'],
    datasets: [
      {
        fill: true,
        label: 'Average Score Progress (%)',
        data: analytics?.scoreData || [0, 0],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4
      },
    ],
  };

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

      <div className="glass-card p-6 h-80 flex flex-col">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="text-purple-400" /> Performance Analytics
        </h3>
        <div className="flex-1 w-full relative">
          <Line options={chartOptions} data={chartData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Focus Areas (Weak Topics) */}
        <div className="glass-card p-6 h-64 flex flex-col overflow-hidden border-t-4 border-red-500/50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-400" /> Focus Areas
          </h3>
          <div className="flex-1 space-y-3 mt-2 overflow-y-auto pr-2 custom-scrollbar">
            {stats?.focusAreas && stats.focusAreas.length > 0 ? (
              stats.focusAreas.map((focus, idx) => (
                 <div key={idx} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex justify-between items-center group">
                  <span className="font-medium text-red-200">{focus.topic}</span>
                  <span className="text-red-400 text-sm">{focus.count} Misses</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic mt-4">You have no weak topics yet. Excellent job!</p>
            )}
          </div>
          <Link to="/quiz" className="text-sm text-purple-400 hover:text-purple-300 mt-4 self-end flex items-center gap-1 group">
            Practice weak areas <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Strong Topics */}
        <div className="glass-card p-6 h-64 flex flex-col overflow-hidden border-t-4 border-green-500/50">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-400">
            <TrendingUp size={20} /> Strong Topics
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {analytics?.strongTopics && analytics.strongTopics.length > 0 ? (
              analytics.strongTopics.map((item, idx) => (
                <div key={idx} className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex justify-between items-center">
                  <span className="font-medium text-green-200">{item.topic}</span>
                  <span className="text-green-400 text-sm">{item.accuracy}% Acc</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic mt-4">No strong topics established yet.</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="glass-card p-6 h-64 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="text-blue-400" size={20} /> Recent Activities
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="space-y-4">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((act, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm group">
                    <span className={`w-2 h-2 rounded-full ${act.type === 'quiz' ? 'bg-purple-500' : 'bg-blue-500'} shrink-0 group-hover:scale-150 transition-transform`}></span>
                    <span className="flex-1 text-gray-200 truncate">{act.title}</span>
                    <span className="text-gray-500 text-[10px] whitespace-nowrap">{new Date(act.createdAt).toLocaleDateString()}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-center italic mt-10">No recent activities.</p>
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