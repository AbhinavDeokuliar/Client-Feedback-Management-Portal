const Category = require('../models/category.model');
const Feedback = require('../models/feedback.model');
const { ApiError } = require('../middleware/error.middleware');
const logger = require('../config/logger');

/**
 * Get all categories
 * @route GET /api/categories
 * @access Private
 */
const getAllCategories = async (req, res, next) => {
  try {
    // Build query with filter for active status if specified
    const filter = {};
    if (req.query.active !== undefined) {
      filter.isActive = req.query.active === 'true';
    }

    const categories = await Category.find(filter).sort('name');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    logger.error('Error getting categories:', error);
    next(error);
  }
};

/**
 * Get category by ID
 * @route GET /api/categories/:id
 * @access Private
 */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    // Get feedback count in this category
    const feedbackCount = await Feedback.countDocuments({ category: req.params.id });

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        feedbackCount
      }
    });
  } catch (error) {
    logger.error(`Error getting category with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Create new category
 * @route POST /api/categories
 * @access Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    // Set creator to current user
    req.body.createdBy = req.user.id;

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('Error creating category:', error);
    next(error);
  }
};

/**
 * Update category
 * @route PUT /api/categories/:id
 * @access Private/Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    // Update the category
    category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error(`Error updating category with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete category
 * @route DELETE /api/categories/:id
 * @access Private/Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    // Check if any feedback items are using this category
    const feedbackCount = await Feedback.countDocuments({ category: req.params.id });

    if (feedbackCount > 0) {
      return next(new ApiError(400, `Cannot delete category as it's associated with ${feedbackCount} feedback items. Consider deactivating it instead.`));
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error deleting category with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Toggle category active status
 * @route PATCH /api/categories/:id/toggle-status
 * @access Private/Admin
 */
const toggleCategoryStatus = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    // Toggle the active status
    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error(`Error toggling status of category with ID ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
};
