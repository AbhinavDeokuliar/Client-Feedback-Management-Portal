const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { feedbackValidation, feedbackUpdateValidation, validate } = require('../middleware/validation.middleware');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/feedback'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  // Accept images, PDFs, and common document formats
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and common document formats are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Import controller
const {
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
} = require('../controllers/feedback.controller');

// All feedback routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', getAllFeedback);
router.get('/statistics/overview', restrictTo('admin'), getFeedbackStatistics);
router.get('/status/:status', getFeedbackByStatus);
router.get('/priority/:priority', getFeedbackByPriority);
router.get('/category/:categoryId', getFeedbackByCategory);
router.get('/:id', getFeedbackById);
router.post('/', upload.array('attachments', 5), feedbackValidation, validate, createFeedback);
router.put('/:id', upload.array('attachments', 5), feedbackUpdateValidation, validate, updateFeedback);
router.post('/:id/comments', upload.array('attachments', 3), addComment);
router.get('/:id/comments', getComments);
router.post('/:id/attachments', upload.array('attachments', 5), addAttachment);
router.get('/:id/history', getFeedbackHistory);

// Routes requiring admin privileges
router.delete('/:id', restrictTo('admin'), deleteFeedback);
router.patch('/:id/assign', restrictTo('admin'), assignFeedback);
router.patch('/:id/status', changeFeedbackStatus);

module.exports = router;

