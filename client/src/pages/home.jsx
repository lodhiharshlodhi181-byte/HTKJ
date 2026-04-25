import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Target, Zap, BrainCircuit, Sparkles, Route, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-visible text-center pb-16">
      
      {/* Background Animated Glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl max-h-96 bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full flex flex-col items-center space-y-10"
      >
        
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-purple-500/30 text-purple-300 text-sm font-medium mb-4">
          <Sparkles size={16} className="text-yellow-400" />
          <span>The Next Generation of Learning</span>
        </motion.div>

        {/* Huge Heading */}
        <motion.div variants={itemVariants} className="space-y-6 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-tight">
            Supercharge Your <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 neon-text-glow inline-block pb-2">
              Learning with AI
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Upload PYQs, discover weak topics, generate study notes, and master any subject with a real-time Voice AI Tutor.
          </p>
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 pt-8">
          <Link to="/dashboard">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="group flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 rounded-full font-bold text-lg text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all"
            >
              Get Started Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </Link>
          <Link to="/chat">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-8 py-4 rounded-full font-bold text-lg text-gray-200 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
            >
              Talk to AI Tutor <Bot size={20} className="text-purple-400" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-16 px-4"
        >
          <FeatureCard 
            icon={<Bot size={32} className="text-purple-400" />}
            title="Voice AI Tutor"
            description="Resolve doubts instantly in matching regional accents using state-of-the-art NLP models."
            delay={0.1}
          />
          <FeatureCard 
            icon={<FileText size={32} className="text-emerald-400" />}
            title="Smart Study Notes"
            description="Generate formatted markdown notes with bullet points for any complicated topic dynamically."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Route size={32} className="text-pink-400" />}
            title="Learning Paths"
            description="Detailed AI-generated roadmaps to take you from a complete beginner to an absolute master."
            delay={0.3}
          />
          <FeatureCard 
            icon={<BrainCircuit size={32} className="text-blue-400" />}
            title="PYQ & Weak Topics"
            description="Analyze past year papers and get targeted quizzes based on your weakest performance areas."
            delay={0.4}
          />
        </motion.div>

      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay }}
    className="glass-card p-8 flex flex-col items-center text-center space-y-4 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-colors shadow-lg group"
  >
    <div className="p-4 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-100">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
  </motion.div>
);

export default Home;