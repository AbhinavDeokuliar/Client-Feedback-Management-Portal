const Feedback = require('../models/feedback.model');
const Category = require('../models/category.model');
const { ApiError } = require('../middleware/error.middleware');
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');

/**
 * Get all feedback items with pagination and filtering
 * @route GET /api/feedback
 * @access Private
 */
const getAllFeedback = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };

    // Fields to exclude from filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);

    // Handle filtering by user role
    if (req.user.role === 'client') {
      // Clients can only see their own feedback
      queryObj.submittedBy = req.user.id;
    }

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|eq|ne|in)\b/g, match => `$${match}`);

    // Initial query
    let query = Feedback.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default sort by newest first
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const [feedback, total] = await Promise.all([
      query.exec(),
      Feedback.countDocuments(JSON.parse(queryStr))
    ]);

    // Send response
    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: feedback
    });
  } catch (error) {
    logger.error('Error getting feedback:', error);
    next(error);
  }
};

/**
 * Get single feedback item by ID
 * @route GET /api/feedback/:id
 * @access Private
 */
const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate({
        path: 'comments.postedBy',
        select: 'name email profileImage'
      });

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    // If client, check if they own this feedback
    if (req.user.role === 'client' &&
        feedback.submittedBy._id.toString() !== req.user.id) {
      return next(new ApiError(403, 'Not authorized to access this feedback'));
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error(`Error getting feedback with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create new feedback
 * @route POST /api/feedback
 * @access Private
 */
const createFeedback = async (req, res, next) => {
  try {
    // Set submitter to current user
    req.body.submittedBy = req.user.id;

    // Process file attachments if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        attachments.push({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        });
      }
    }

    // Create feedback with attachments
    const feedback = await Feedback.create({
      ...req.body,
      attachments
    });

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error('Error creating feedback:', error);

    // Clean up uploaded files in case of error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) logger.error(`Error deleting file ${file.path}:`, err);
        });
      });
    }

    next(error);
  }
};

/**
 * Update feedback
 * @route PUT /api/feedback/:id
 * @access Private
 */
const updateFeedback = async (req, res, next) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    // Check ownership if user is client
    if (req.user.role === 'client' &&
        feedback.submittedBy._id.toString() !== req.user.id) {
      return next(new ApiError(403, 'Not authorized to update this feedback'));
    }

    // Set performed by for history tracking
    feedback._performedBy = req.user.id;

    // Process file attachments if any
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));

      feedback.attachments = [...feedback.attachments, ...newAttachments];
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'category', 'priority', 'status', 'tags'];
    allowedUpdates.forEach(update => {
      if (req.body[update] !== undefined) {
        feedback[update] = req.body[update];
      }
    });

    // Save the updated feedback
    await feedback.save();

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error(`Error updating feedback with ID ${req.params.id}:`, error);

    // Clean up uploaded files in case of error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) logger.error(`Error deleting file ${file.path}:`, err);
        });
      });
    }

    next(error);
  }
};

/**
 * Delete feedback
 * @route DELETE /api/feedback/:id
 * @access Private/Admin
 */
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    // Delete associated files
    if (feedback.attachments && feedback.attachments.length > 0) {
      feedback.attachments.forEach(attachment => {
        fs.unlink(attachment.path, err => {
          if (err) logger.error(`Error deleting file ${attachment.path}:`, err);
        });
      });
    }

    // Delete the feedback
    await feedback.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error deleting feedback with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get feedback by status
 * @route GET /api/feedback/status/:status
 * @access Private
 */
const getFeedbackByStatus = async (req, res, next) => {
  try {
    const query = { status: req.params.status };

    // If client, only show their feedback
    if (req.user.role === 'client') {
      query.submittedBy = req.user.id;
    }

    const feedback = await Feedback.find(query);

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    logger.error(`Error getting feedback by status ${req.params.status}:`, error);
    next(error);
  }
};

/**
 * Get feedback by priority
 * @route GET /api/feedback/priority/:priority
 * @access Private
 */
const getFeedbackByPriority = async (req, res, next) => {
  try {
    const query = { priority: req.params.priority };

    // If client, only show their feedback
    if (req.user.role === 'client') {
      query.submittedBy = req.user.id;
    }

    const feedback = await Feedback.find(query);

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    logger.error(`Error getting feedback by priority ${req.params.priority}:`, error);
    next(error);
  }
};

/**
 * Get feedback by category
 * @route GET /api/feedback/category/:categoryId
 * @access Private
 */
const getFeedbackByCategory = async (req, res, next) => {
  try {
    const query = { category: req.params.categoryId };

    // If client, only show their feedback
    if (req.user.role === 'client') {
      query.submittedBy = req.user.id;
    }

    const feedback = await Feedback.find(query);

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    logger.error(`Error getting feedback by category ${req.params.categoryId}:`, error);
    next(error);
  }
};

/**
 * Assign feedback to user
 * @route PATCH /api/feedback/:id/assign
 * @access Private/Admin
 */
const assignFeedback = async (req, res, next) => {
  try {
    const { assignToUserId } = req.body;

    if (!assignToUserId) {
      return next(new ApiError(400, 'Please provide user ID to assign'));
    }

    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    // Set performed by for history tracking
    feedback._performedBy = req.user.id;

    // Update assigned user
    feedback.assignedTo = assignToUserId;

    // Update status to in-progress if it's new
    if (feedback.status === 'new') {
      feedback.status = 'in-progress';
    }

    await feedback.save();

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error(`Error assigning feedback with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Change feedback status
 * @route PATCH /api/feedback/:id/status
 * @access Private
 */
const changeFeedbackStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return next(new ApiError(400, 'Please provide status'));
    }

    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    // Check if client is authorized to change status
    if (req.user.role === 'client') {
      // Clients can only change status of their own feedback and only to specific statuses
      if (feedback.submittedBy._id.toString() !== req.user.id) {
        return next(new ApiError(403, 'Not authorized to change this feedback status'));
      }

      // Clients can only set status to 'closed' or 'reopened'
      if (!['closed', 'reopened'].includes(status)) {
        return next(new ApiError(403, 'Clients can only close or reopen feedback'));
      }
    }

    // Set performed by for history tracking
    feedback._performedBy = req.user.id;

    // Update status
    feedback.status = status;

    // Update timestamp based on status
    if (status === 'resolved') {
      feedback.resolvedAt = Date.now();
    } else if (status === 'closed') {
      feedback.closedAt = Date.now();
    } else if (status === 'reopened') {
      feedback.reopenedAt = Date.now();
    }

    await feedback.save();

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error(`Error changing status of feedback with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add comment to feedback
 * @route POST /api/feedback/:id/comments
 * @access Private
 */
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return next(new ApiError(400, 'Comment text is required'));
    }

    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    // Process file attachments if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        attachments.push({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        });
      }
    }

    // Create comment
    const comment = {
      text,
      postedBy: req.user.id,
      attachments
    };

    // Add comment to feedback
    feedback.comments.push(comment);

    // Add to history
    feedback.history.push({
      action: 'commented',
      performedBy: req.user.id
    });

    await feedback.save();

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error(`Error adding comment to feedback with ID ${req.params.id}:`, error);

    // Clean up uploaded files in case of error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) logger.error(`Error deleting file ${file.path}:`, err);
        });
      });
    }

    next(error);
  }
};

/**
 * Get comments for feedback
 * @route GET /api/feedback/:id/comments
 * @access Private
 */
const getComments = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate({
        path: 'comments.postedBy',
        select: 'name email profileImage'
      });

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    // Check authorization for clients
    if (req.user.role === 'client' &&
        feedback.submittedBy._id.toString() !== req.user.id) {
      return next(new ApiError(403, 'Not authorized to view these comments'));
    }

    res.status(200).json({
      success: true,
      count: feedback.comments.length,
      data: feedback.comments
    });
  } catch (error) {
    logger.error(`Error getting comments for feedback with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add attachments to feedback
 * @route POST /api/feedback/:id/attachments
 * @access Private
 */
const addAttachment = async (req, res, next) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    // Check authorization for clients
    if (req.user.role === 'client' &&
        feedback.submittedBy._id.toString() !== req.user.id) {
      return next(new ApiError(403, 'Not authorized to add attachments to this feedback'));
    }

    // Process file attachments
    if (!req.files || req.files.length === 0) {
      return next(new ApiError(400, 'No files uploaded'));
    }

    const newAttachments = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    }));

    // Add attachments to feedback
    feedback.attachments = [...feedback.attachments, ...newAttachments];

    // Add to history
    feedback.history.push({
      action: 'updated',
      field: 'attachments',
      performedBy: req.user.id
    });

    await feedback.save();

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error(`Error adding attachments to feedback with ID ${req.params.id}:`, error);

    // Clean up uploaded files in case of error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, err => {
          if (err) logger.error(`Error deleting file ${file.path}:`, err);
        });
      });
    }

    next(error);
  }
};

/**
 * Get feedback history
 * @route GET /api/feedback/:id/history
 * @access Private
 */
const getFeedbackHistory = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate({
        path: 'history.performedBy',
        select: 'name email profileImage'
      });

    if (!feedback) {
      return next(new ApiError(404, 'Feedback not found'));
    }

    // Check authorization for clients
    if (req.user.role === 'client' &&
        feedback.submittedBy._id.toString() !== req.user.id) {
      return next(new ApiError(403, 'Not authorized to view this feedback history'));
    }

    res.status(200).json({
      success: true,
      count: feedback.history.length,
      data: feedback.history
    });
  } catch (error) {
    logger.error(`Error getting history for feedback with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get feedback statistics
 * @route GET /api/feedback/statistics/overview
 * @access Private/Admin
 */
const getFeedbackStatistics = async (req, res, next) => {
  try {
    // Filter options
    const filter = {};

    // Date range filtering
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Get basic statistics
    const stats = await Feedback.getAnalytics(filter);

    // Get category distribution
    const categoryDistribution = await Feedback.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { _id: 0, name: '$category.name', count: 1 } },
      { $sort: { count: -1 } }
    ]);

    // Get trends over time
    const timeTrend = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', count: 1 } }
    ]);

    // Get response time performance
    const responsePerformance = await Feedback.aggregate([
      { $match: { ...filter, comments: { $exists: true, $ne: [] } } },
      {
        $project: {
          responseTime: {
            $subtract: [
              { $arrayElemAt: ['$comments.createdAt', 0] },
              '$createdAt'
            ]
          },
          priority: 1
        }
      },
      {
        $group: {
          _id: '$priority',
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' }
        }
      },
      { $project: {
        _id: 0,
        priority: '$_id',
        avgResponseTime: 1,
        minResponseTime: 1,
        maxResponseTime: 1
      }}
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {},
        categoryDistribution,
        timeTrend,
        responsePerformance
      }
    });
  } catch (error) {
    logger.error('Error getting feedback statistics:', error);
    next(error);
  }
};

module.exports = {
  getAllFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackByStatus,
  getFeedbackByPriority,
  getFeedbackByCategory,
  assignFeedback,
  changeFeedbackStatus,
  addComment,
  getComments,
  addAttachment,
  getFeedbackHistory,
  getFeedbackStatistics
};
