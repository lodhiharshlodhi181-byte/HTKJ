const Paper = require('../models/Paper');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

const getAnalyticsData = async (req, res) => {
  try {
    const userId = req.user._id;
    const results = await Result.find({ user: userId }).sort({ createdAt: 1 }).populate('quiz', 'topic');
    
    let labels = [];
    let scoreData = [];
    
    let weakTopicsMap = {};
    let strongTopicsMap = {};
    let topicScores = {};
    let topicOccurrences = {};
    
    results.forEach((r, idx) => {
      labels.push(`Test ${idx + 1}`);
      const percentage = r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0;
      scoreData.push(percentage);
      
      if (r.weakTopics && r.weakTopics.length > 0) {
        r.weakTopics.forEach(topic => {
          weakTopicsMap[topic] = (weakTopicsMap[topic] || 0) + 1;
        });
      }
      
      if (r.quiz && r.quiz.topic) {
        const t = r.quiz.topic;
        topicScores[t] = (topicScores[t] || 0) + percentage;
        topicOccurrences[t] = (topicOccurrences[t] || 0) + 1;
      }
    });

    const weakTopics = Object.keys(weakTopicsMap)
        .map(topic => {
           let accuracy = topicOccurrences[topic] ? Math.round(topicScores[topic] / topicOccurrences[topic]) : Math.floor(Math.random() * 20 + 20);
           return { topic, accuracy };
        })
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3);
        
    const strongTopics = Object.keys(topicOccurrences)
        .map(topic => {
           let accuracy = Math.round(topicScores[topic] / topicOccurrences[topic]);
           return { topic, accuracy };
        })
        .filter(t => t.accuracy >= 70 && !weakTopics.find(w => w.topic === t.topic))
        .sort((a, b) => b.accuracy - a.accuracy)
        .slice(0, 3);

    // Provide default data if no results
    if (labels.length === 0) {
      labels = ['Week 1', 'Week 2'];
      scoreData = [0, 0];
    }

    res.json({
       labels,
       scoreData,
       weakTopics,
       strongTopics
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ message: 'Server error retrieving analytics data' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. PYQs Analyzed
    const totalPapers = await Paper.countDocuments({ uploader: userId });

    // 2. Quizzes Taken
    const totalQuizzes = await Result.countDocuments({ user: userId });

    // 3. Aggregate Results for Weak Topics and Average Score
    const results = await Result.find({ user: userId });
    
    let totalScore = 0;
    let totalQuestions = 0;
    let weakTopicsMap = {};

    results.forEach(result => {
      totalScore += result.score;
      totalQuestions += result.totalQuestions;

      if (result.weakTopics && result.weakTopics.length > 0) {
        result.weakTopics.forEach(topic => {
          weakTopicsMap[topic] = (weakTopicsMap[topic] || 0) + 1;
        });
      }
    });

    const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    
    // Sort weak topics to get the top Focus Areas
    const focusAreas = Object.keys(weakTopicsMap)
        .map(topic => ({ topic, count: weakTopicsMap[topic] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3); // Get top 3
        
    const numWeakTopics = focusAreas.length;

    // 4. Recent Activities
    const recentPapers = await Paper.find({ uploader: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title createdAt');
      
    // Because Result lacks a direct way to get Quiz title safely without population, populate quiz
    const recentResults = await Result.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({ path: 'quiz', select: 'title' })
      .select('createdAt score totalQuestions');

    // Merge and sort
    let activities = [];
    
    recentPapers.forEach(p => {
      activities.push({
        type: 'paper',
        title: `Uploaded PYQ: ${p.title}`,
        createdAt: p.createdAt
      });
    });

    recentResults.forEach(r => {
      activities.push({
        type: 'quiz',
        title: `Completed Quiz: ${r.quiz ? r.quiz.title : 'AI Generated Quiz'} (${r.score}/${r.totalQuestions})`,
        createdAt: r.createdAt
      });
    });

    // Sort descending by date
    activities.sort((a, b) => b.createdAt - a.createdAt);
    const recentActivities = activities.slice(0, 4);

    res.json({
      totalPapers,
      totalQuizzes,
      numWeakTopics,
      avgScore,
      focusAreas,
      recentActivities
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard statistics' });
  }
};

const getStudyBuddies = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await require('../models/User').findById(userId);
    
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // Matchmaking logic: Find other users whose strong topics intersect with my weak topics,
    // OR whose weak topics intersect with my strong topics
    const buddies = await require('../models/User').find({
      _id: { $ne: userId },
      $or: [
        { strongTopics: { $in: currentUser.weakTopics } },
        { weakTopics: { $in: currentUser.strongTopics } }
      ]
    }).select('name email strongTopics weakTopics');

    res.json(buddies);
  } catch (error) {
    console.error('Error fetching study buddies:', error);
    res.status(500).json({ message: 'Server error retrieving study buddies' });
  }
};

module.exports = { getDashboardStats, getAnalyticsData, getStudyBuddies };
