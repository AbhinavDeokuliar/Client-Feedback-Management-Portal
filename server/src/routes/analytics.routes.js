const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');

// We'll use the feedback controller's statistics functionality
const { getFeedbackStatistics } = require('../controllers/feedback.controller');

// All analytics routes require authentication
router.use(protect);

// Overview statistics
router.get('/feedback/overview', getFeedbackStatistics);

// Additional analytics routes can be added here as the application grows
// These would typically be admin-only routes
router.get('/dashboard', restrictTo('admin'), (req, res) => {
  // This is a placeholder for future dashboard analytics
  res.status(200).json({
    success: true,
    message: 'Analytics dashboard data endpoint - to be implemented',
    data: {
      totalFeedback: 0,
      activeFeedback: 0,
      resolvedRate: 0,
      averageResponseTime: 0
    }
  });
});

module.exports = router;
