const express = require('express');
const router = express.Router();
const { submitQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitQuiz);

module.exports = router;
