const express = require('express');
const router = express.Router();
const { getDueCards, reviewCard } = require('../controllers/srsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/due', protect, getDueCards);
router.post('/review/:cardId', protect, reviewCard);

module.exports = router;
