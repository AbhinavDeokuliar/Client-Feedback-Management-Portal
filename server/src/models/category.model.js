const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property to get number of feedback items in this category
categorySchema.virtual('feedbackCount', {
  ref: 'Feedback',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Pre-find middleware to populate creator info
categorySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'createdBy',
    select: 'name email'
  });
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
