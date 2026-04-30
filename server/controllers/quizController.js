const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const Flashcard = require('../models/Flashcard');

const submitQuiz = async (req, res) => {
  try {
    const { topic, difficulty, questions, selectedAnswers } = req.body;
    const userId = req.user._id;

    // 1. Save Quiz for History
    const quiz = await Quiz.create({
      title: `${topic} Quiz - ${difficulty}`,
      topic,
      creator: userId,
      questions,
      isAiGenerated: true
    });

    // 2. Evaluate answers
    let score = 0;
    let weakTopics = [];
    const totalQuestions = questions.length;
    let flashcardsToCreate = [];

    questions.forEach((q, index) => {
      const userAnswer = selectedAnswers[index];
      // Compare ignoring leading/trailing spaces and case
      const isCorrect = userAnswer && q.correctAnswer && 
          userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

      if (isCorrect) {
        score++;
      } else {
        if (!weakTopics.includes(topic)) {
          weakTopics.push(topic);
        }
        
        flashcardsToCreate.push({
          user: userId,
          topic: topic,
          questionText: q.questionText,
          correctAnswer: q.correctAnswer,
          options: q.options || [],
          explanation: q.explanation || "No explanation provided.",
          nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        });
      }
    });

    if (flashcardsToCreate.length > 0) {
      await Flashcard.insertMany(flashcardsToCreate);
    }

    // 3. Mark Result in DB
    const result = await Result.create({
      user: userId,
      quiz: quiz._id,
      score,
      totalQuestions,
      weakTopics
    });

    // 4. Update User Profile Strong/Weak Topics for Matchmaking
    const user = await require('../models/User').findById(userId);
    if (user) {
      if (score >= totalQuestions * 0.7) {
        if (!user.strongTopics.includes(topic)) {
          user.strongTopics.push(topic);
        }
        user.weakTopics = user.weakTopics.filter(t => t !== topic);
      } else {
        if (!user.weakTopics.includes(topic)) {
          user.weakTopics.push(topic);
        }
        user.strongTopics = user.strongTopics.filter(t => t !== topic);
      }
      await user.save();
    }

    res.status(201).json({ message: 'Quiz evaluated and submitted successfully', result, score });
  } catch (error) {
    console.error('Quiz Submission Error:', error);
    res.status(500).json({ message: 'Failed to submit quiz result' });
  }
};

module.exports = { submitQuiz };
