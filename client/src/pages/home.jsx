import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Target, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-fade-in">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Supercharge Your Learning with <br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 neon-text-glow">AI Power</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
          Upload your PYQs, detect your weak topics, generate smart quizzes, and master any subject with our real-time Voice AI Tutor.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition duration-300 transform hover:scale-105">
          Get Started <ArrowRight size={20} />
        </Link>
        <Link to="/chat" className="flex items-center gap-2 bg-white/10 border border-white/20 px-8 py-3 rounded-full font-bold text-lg hover:bg-white/20 transition duration-300 backdrop-blur-md">
          Talk to AI Tutor <Bot size={20} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16">
        <FeatureCard 
          icon={<Bot size={32} className="text-purple-400" />}
          title="AI & Voice Tutor"
          description="Resolve doubts instantly in multiple languages using state-of-the-art NLP models."
        />
        <FeatureCard 
          icon={<Target size={32} className="text-pink-400" />}
          title="PYQ Analyzer"
          description="Upload your past year questions. Let AI extract trends and predict the next exam paper."
        />
        <FeatureCard 
          icon={<Zap size={32} className="text-blue-400" />}
          title="Weak Topic Detection"
          description="AI automatically curates a study plan by analyzing your dynamic quiz performance."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card p-6 flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition duration-300 cursor-pointer">
    <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:neon-border-glow">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-100">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export default Home;