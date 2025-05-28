const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { categoryValidation, validate } = require('../middleware/validation.middleware');

// Import controller
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} = require('../controllers/category.controller');

// All routes require authentication
router.use(protect);

// Routes accessible to all authenticated users
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Routes requiring admin privileges
router.post('/', restrictTo('admin'), categoryValidation, validate, createCategory);
router.put('/:id', restrictTo('admin'), categoryValidation, validate, updateCategory);
router.delete('/:id', restrictTo('admin'), deleteCategory);
router.patch('/:id/toggle-status', restrictTo('admin'), toggleCategoryStatus);

module.exports = router;

