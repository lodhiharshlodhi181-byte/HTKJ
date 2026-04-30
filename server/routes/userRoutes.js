const express = require('express');
const router = express.Router();
const { getDashboardStats, getAnalyticsData, getStudyBuddies } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/analytics', protect, getAnalyticsData);
router.get('/matchmaking', protect, getStudyBuddies);

module.exports = router;
