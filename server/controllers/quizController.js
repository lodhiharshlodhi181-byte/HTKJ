const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

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
      }
    });

    // 3. Mark Result in DB
    const result = await Result.create({
      user: userId,
      quiz: quiz._id,
      score,
      totalQuestions,
      weakTopics
    });

    res.status(201).json({ message: 'Quiz evaluated and submitted successfully', result, score });
  } catch (error) {
    console.error('Quiz Submission Error:', error);
    res.status(500).json({ message: 'Failed to submit quiz result' });
  }
};

module.exports = { submitQuiz };
