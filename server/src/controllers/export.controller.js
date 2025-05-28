const ExportLog = require('../models/export-log.model');
const Feedback = require('../models/feedback.model');
const { ApiError } = require('../middleware/error.middleware');
const { ExportUtility } = require('../utils/export.utils');
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');

/**
 * Export feedback data
 * @route POST /api/exports/feedback
 * @access Private
 */
const exportFeedback = async (req, res, next) => {
  try {
    // Extract filters from request
    const filters = buildFilters(req);

    // Get export format preference (xlsx or csv)
    const format = (req.body.format || 'xlsx').toLowerCase();
    if (!['xlsx', 'csv'].includes(format)) {
      return next(new ApiError(400, "Format must be 'xlsx' or 'csv'"));
    }

    // Get feedback data
    const feedback = await getFeedbackData(filters, req.user);

    // Debug log to check data
    logger.info(`Exporting ${feedback.length} feedback records for user ${req.user.email}`);

    if (!feedback || feedback.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No feedback data found matching the provided filters',
        data: null
      });
    }

    // Generate export
    const exporter = new ExportUtility(req.user, filters);
    const result = await exporter.generateExport(feedback, format, 'feedback');

    res.status(200).json({
      success: true,
      message: 'Export completed successfully',
      data: {
        exportId: result.exportLogId,
        fileName: result.fileName,
        recordCount: feedback.length,
        format: format,
        downloadUrl: `/api/exports/download/${result.exportLogId}`
      }
    });
  } catch (error) {
    logger.error('Error exporting feedback:', error);
    next(error);
  }
};

/**
 * Export analytics data
 * @route POST /api/exports/analytics
 * @access Private
 */
const exportAnalytics = async (req, res, next) => {
  try {
    // Extract filters from request
    const filters = buildFilters(req);

    // Get export format preference (xlsx or csv)
    const format = (req.body.format || 'xlsx').toLowerCase();
    if (!['xlsx', 'csv'].includes(format)) {
      return next(new ApiError(400, "Format must be 'xlsx' or 'csv'"));
    }

    // Get analytics data
    const analyticsData = await getAnalyticsData(filters, req.user);

    // Generate export
    const exporter = new ExportUtility(req.user, filters);
    const result = await exporter.generateExport(
      analyticsData.overview ? [analyticsData] : [],
      format,
      'analytics'
    );

    res.status(200).json({
      success: true,
      message: 'Analytics export completed successfully',
      data: {
        exportId: result.exportLogId,
        fileName: result.fileName,
        format: format,
        downloadUrl: `/api/exports/download/${result.exportLogId}`
      }
    });
  } catch (error) {
    logger.error('Error exporting analytics:', error);
    next(error);
  }
};

/**
 * Get export history
 * @route GET /api/exports/history
 * @access Private/Admin
 */
const getExportHistory = async (req, res, next) => {
  try {
    // Build query
    const query = {};

    // If not admin, only show user's exports
    if (req.user.role !== 'admin') {
      query.generatedBy = req.user._id;
    }

    // Filter by export type if provided
    if (req.query.type) {
      query.exportType = req.query.type;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Execute query
    const [exports, total] = await Promise.all([
      ExportLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ExportLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: exports.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: exports
    });
  } catch (error) {
    logger.error('Error getting export history:', error);
    next(error);
  }
};

/**
 * Download export file
 * @route GET /api/exports/download/:id
 * @access Private
 */
const downloadExport = async (req, res, next) => {
  try {
    const exportLog = await ExportLog.findById(req.params.id);

    if (!exportLog) {
      return next(new ApiError(404, 'Export not found'));
    }

    // Check if user is authorized
    if (exportLog.generatedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Not authorized to download this export'));
    }

    // Check if export is complete
    if (exportLog.status !== 'completed') {
      return next(new ApiError(400, `Export is ${exportLog.status}`));
    }

    // Check if file exists
    if (!fs.existsSync(exportLog.filePath)) {
      return next(new ApiError(404, 'Export file not found'));
    }

    // Update download count and last downloaded time
    exportLog.downloadCount = (exportLog.downloadCount || 0) + 1;
    exportLog.lastDownloadedAt = Date.now();
    await exportLog.save();

    // Set content type based on export type
    let contentType = 'application/octet-stream';
    if (exportLog.exportType === 'excel') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (exportLog.exportType === 'csv') {
      contentType = 'text/csv';
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportLog.fileName}"`);

    // Stream file instead of loading it all into memory
    const fileStream = fs.createReadStream(exportLog.filePath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on('error', (error) => {
      logger.error(`Error streaming file ${exportLog.filePath}:`, error);
      if (!res.headersSent) {
        return next(new ApiError(500, 'Error streaming export file'));
      }
    });
  } catch (error) {
    logger.error(`Error downloading export ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Build filters from request
 */
const buildFilters = (req) => {
  const filters = {};

  // Date range filtering
  if (req.body.startDate && req.body.endDate) {
    filters.createdAt = {
      $gte: new Date(req.body.startDate),
      $lte: new Date(req.body.endDate)
    };
  }

  // Status filtering
  if (req.body.status) {
    filters.status = Array.isArray(req.body.status)
      ? { $in: req.body.status }
      : req.body.status;
  }

  // Priority filtering
  if (req.body.priority) {
    filters.priority = Array.isArray(req.body.priority)
      ? { $in: req.body.priority }
      : req.body.priority;
  }

  // Category filtering
  if (req.body.category) {
    filters.category = Array.isArray(req.body.category)
      ? { $in: req.body.category }
      : req.body.category;
  }

  return filters;
};

/**
 * Get feedback data with filters
 */
const getFeedbackData = async (filters, user) => {
  // If user is client, only show their feedback
  if (user.role === 'client') {
    filters.submittedBy = user._id;
  }

  // Query with population
  const feedback = await Feedback.find(filters)
    .populate('category', 'name')
    .populate('submittedBy', 'name email')
    .populate('assignedTo', 'name email')
    .lean()
    .sort('-createdAt');

  // Add tag and comment counts
  return feedback.map(item => ({
    ...item,
    tagsCount: Array.isArray(item.tags) ? item.tags.length : 0,
    commentsCount: Array.isArray(item.comments) ? item.comments.length : 0
  }));
};

/**
 * Get analytics data with filters
 */
const getAnalyticsData = async (filters, user) => {
  // If user is client, only include their feedback in analytics
  if (user.role === 'client') {
    filters.submittedBy = user._id;
  }

  // Basic statistics
  const stats = await Feedback.getAnalytics(filters);

  // Category distribution
  const categoryDistribution = await Feedback.aggregate([
    { $match: filters },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $project: { _id: 0, name: '$category.name', count: 1 } },
    { $sort: { count: -1 } }
  ]);

  // Time trends
  const timeTrend = await Feedback.aggregate([
    { $match: filters },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } }
  ]);

  return {
    overview: stats[0] || {},
    categoryDistribution,
    timeTrend
  };
};

module.exports = {
  exportFeedback,
  exportAnalytics,
  getExportHistory,
  downloadExport
};
