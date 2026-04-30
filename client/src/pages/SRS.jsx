import React, { useState, useEffect } from 'react';
import { getDueCards, reviewCard } from '../assets/services/userAPI';
import { BrainCircuit, Check, X, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SRS = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await getDueCards();
      setCards(res.data);
    } catch (err) {
      console.error("Error fetching SRS cards", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality) => {
    setReviewing(true);
    try {
      const currentCard = cards[currentIndex];
      await reviewCard(currentCard._id, quality);
      
      // Move to next card
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setReviewing(false);
      }, 300);
    } catch (err) {
      console.error("Error reviewing card", err);
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-purple-500" size={50} />
      </div>
    );
  }

  if (cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-center py-20">
        <div className="glass-card p-12 flex flex-col items-center">
          <BrainCircuit size={80} className="text-green-500 mb-6" />
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-4">
            You're all caught up!
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            You have reviewed all your due flashcards for today. Your memory is getting stronger!
          </p>
          <button onClick={fetchCards} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full transition-colors text-white font-bold">
            <RefreshCw size={18} /> Check Again
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 uppercase tracking-tight">
          Spaced Repetition
        </h1>
        <p className="text-gray-400 font-medium max-w-2xl mx-auto">
          Review concepts you struggled with. Our algorithm ensures you revise them right before you forget.
        </p>
        <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-bold mt-4">
          Card {currentIndex + 1} of {cards.length}
        </div>
      </div>

      <div className="perspective-1000 w-full h-96 relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex + (isFlipped ? '-back' : '-front')}
            initial={{ rotateX: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 w-full h-full glass-card p-10 flex flex-col justify-center items-center text-center cursor-pointer border-2 ${isFlipped ? 'border-purple-500/50' : 'border-white/10 hover:border-white/30'}`}
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            {!isFlipped ? (
              <>
                <span className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">{currentCard.topic}</span>
                <h3 className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
                  {currentCard.questionText}
                </h3>
                <p className="mt-8 text-gray-500 flex items-center gap-2 animate-pulse">
                  Click to reveal answer <ArrowRight size={16}/>
                </p>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4">Answer</span>
                <h3 className="text-2xl font-bold text-white mb-6">
                  {currentCard.correctAnswer}
                </h3>
                {currentCard.explanation && (
                  <p className="text-gray-400 text-sm max-w-lg italic">
                    {currentCard.explanation}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {isFlipped && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-4 mt-8"
        >
          <button 
            onClick={() => handleReview(1)}
            disabled={reviewing}
            className="flex-1 max-w-[150px] bg-red-500/20 hover:bg-red-500 border border-red-500 text-white font-bold py-4 rounded-2xl transition-all group flex flex-col items-center gap-2"
          >
            <X size={24} className="group-hover:scale-125 transition-transform" />
            Again
          </button>
          <button 
            onClick={() => handleReview(3)}
            disabled={reviewing}
            className="flex-1 max-w-[150px] bg-orange-500/20 hover:bg-orange-500 border border-orange-500 text-white font-bold py-4 rounded-2xl transition-all group flex flex-col items-center gap-2"
          >
            <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
            Hard
          </button>
          <button 
            onClick={() => handleReview(5)}
            disabled={reviewing}
            className="flex-1 max-w-[150px] bg-green-500/20 hover:bg-green-500 border border-green-500 text-white font-bold py-4 rounded-2xl transition-all group flex flex-col items-center gap-2"
          >
            <Check size={24} className="group-hover:scale-125 transition-transform" />
            Easy
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SRS;
