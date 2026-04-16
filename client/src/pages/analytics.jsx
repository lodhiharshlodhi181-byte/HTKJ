import React, { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { getAnalyticsData } from '../assets/services/userAPI';

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

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await getAnalyticsData();
        setAnalytics(data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError("Failed to fetch analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

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

  const options = {
    responsive: true,
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

  const data = {
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
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <p className="text-gray-400">Track your progress and AI-based weak topic detection.</p>
      </div>

      <div className="glass-card p-6 md:p-10">
        <h3 className="text-xl font-bold mb-6 text-purple-300">Score Trajectory</h3>
        <div className="w-full h-[400px]">
          <Line options={options} data={data} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-t-4 border-red-500">
          <h3 className="text-lg font-bold mb-4 text-red-400">Weak Topics Identified</h3>
          <ul className="space-y-3">
            {analytics?.weakTopics && analytics.weakTopics.length > 0 ? (
              analytics.weakTopics.map((item, idx) => (
                <li key={idx} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm text-red-200">
                  <span className="font-bold">{item.topic}:</span> (Accuracy: {item.accuracy}%)
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No weak topics found.</p>
            )}
          </ul>
        </div>
        
        <div className="glass-card p-6 border-t-4 border-green-500">
          <h3 className="text-lg font-bold mb-4 text-green-400">Strong Topics</h3>
          <ul className="space-y-3">
            {analytics?.strongTopics && analytics.strongTopics.length > 0 ? (
              analytics.strongTopics.map((item, idx) => (
                <li key={idx} className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-sm text-green-200">
                  <span className="font-bold">{item.topic}:</span> (Accuracy: {item.accuracy}%)
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No strong topics established yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;