const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const User = require('../models/user.model');

// Since there's no dedicated user controller yet, we'll use the auth controller
// for basic user functionality
const {
  getCurrentUser
} = require('../controllers/auth.controller');

// All users controller functions
const getAllUsers = async (req, res, next) => {
  try {
    // Set up filtering
    let filter = {};

    // If not admin, restrict to only seeing active users
    if (req.user.role !== 'admin') {
      filter = { isActive: true };
    }

    // Get users with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Execute query
    const users = await User.find(filter)
      .select('-password')
      .sort('name')
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Get team members for assignment (non-client users)
const getTeamMembers = async (req, res, next) => {
  try {
    const teamMembers = await User.find({
      role: { $ne: 'client' },
      isActive: true
    }).select('name email role department profileImage');

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      data: teamMembers
    });
  } catch (error) {
    next(error);
  }
};

// User routes
router.use(protect); // All user routes require authentication

// Get current user profile
router.get('/me', getCurrentUser);

// Get all users (admin only)
router.get('/', restrictTo('admin'), getAllUsers);

// Get team members (for assignment)
router.get('/team', restrictTo('admin', 'manager'), getTeamMembers);

// Future user management endpoints would be added here
// Examples:
// router.get('/:id', restrictTo('admin'), getUserById);
// router.put('/:id', restrictTo('admin'), updateUser);
// router.delete('/:id', restrictTo('admin'), deleteUser);

module.exports = router;
