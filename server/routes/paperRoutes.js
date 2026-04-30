const express = require('express');
const router = express.Router();
const { savePaper } = require('../controllers/paperController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, savePaper);

module.exports = router;
