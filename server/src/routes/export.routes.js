const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateExportRequest } = require('../middleware/validation.middleware');

// Import controller
const {
  exportFeedback,
  exportAnalytics,
  getExportHistory,
  downloadExport
} = require('../controllers/export.controller');

// All routes require authentication
router.use(protect);

// Export endpoints with format support
router.post('/feedback', validateExportRequest, exportFeedback);
router.post('/analytics', validateExportRequest, exportAnalytics);

// Export history and download
router.get('/history', getExportHistory);
router.get('/download/:id', downloadExport);

module.exports = router;

