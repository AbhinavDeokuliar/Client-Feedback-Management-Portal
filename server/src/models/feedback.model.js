const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  priority: {
    type: String,
    required: [true, 'Priority level is required'],
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Priority must be low, medium, high, or critical'
    },
    default: 'medium'
  },
  status: {
    type: String,
    enum: {
      values: ['new', 'in-progress', 'resolved', 'closed', 'reopened'],
      message: 'Status must be new, in-progress, resolved, closed, or reopened'
    },
    default: 'new'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Submitter information is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    filename: String,
    originalname: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  resolvedAt: Date,
  closedAt: Date,
  reopenedAt: Date,
  comments: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    attachments: [{
      filename: String,
      originalname: String,
      path: String,
      mimetype: String,
      size: Number
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  history: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'status-changed', 'assigned', 'commented', 'resolved', 'reopened'],
      required: true
    },
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for fast querying
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ priority: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ submittedBy: 1 });
feedbackSchema.index({ assignedTo: 1 });
feedbackSchema.index({ createdAt: 1 });

// Pre-find middleware to populate relations
feedbackSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'category',
    select: 'name'
  })
  .populate({
    path: 'submittedBy',
    select: 'name email profileImage'
  })
  .populate({
    path: 'assignedTo',
    select: 'name email profileImage'
  });

  next();
});

// Pre-save middleware to track history
feedbackSchema.pre('save', function(next) {
  // If the document is new, add a 'created' entry
  if (this.isNew) {
    this.history.push({
      action: 'created',
      performedBy: this.submittedBy
    });
    return next();
  }

  // Get the modified paths
  const modifiedPaths = this.modifiedPaths();

  // If there are changes, track them in history
  if (modifiedPaths.length > 0) {
    modifiedPaths.forEach(path => {
      // Skip history array itself and timestamp fields
      if (path === 'history' || path === 'updatedAt' || path.startsWith('history.')) {
        return;
      }

      let action = 'updated';
      if (path === 'status') {
        action = 'status-changed';

        // Set timestamp based on the new status
        if (this.status === 'resolved') {
          this.resolvedAt = Date.now();
        } else if (this.status === 'closed') {
          this.closedAt = Date.now();
        } else if (this.status === 'reopened') {
          this.reopenedAt = Date.now();
        }
      } else if (path === 'assignedTo') {
        action = 'assigned';
      }

      this.history.push({
        action,
        field: path,
        oldValue: this.getOldValue(path),
        newValue: this[path],
        performedBy: this._performedBy || this.submittedBy // _performedBy is set by the controller
      });
    });
  }

  next();
});

// Add method to get the old value of a path
feedbackSchema.methods.getOldValue = function(path) {
  return this.$__.previousValue ? this.$__.previousValue[path] : undefined;
};

// Virtual property for response time (time to first response)
feedbackSchema.virtual('responseTime').get(function() {
  if (this.comments && this.comments.length > 0 && this.createdAt) {
    return this.comments[0].createdAt - this.createdAt;
  }
  return null;
});

// Virtual property for resolution time
feedbackSchema.virtual('resolutionTime').get(function() {
  if (this.resolvedAt && this.createdAt) {
    return this.resolvedAt - this.createdAt;
  }
  return null;
});

// Static method to get feedback analytics
feedbackSchema.statics.getAnalytics = async function(filters = {}) {
  return this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        reopened: { $sum: { $cond: [{ $eq: ['$status', 'reopened'] }, 1, 0] } },
        lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
        mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        criticalPriority: { $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] } },
        avgResponseTime: { $avg: { $subtract: [{ $arrayElemAt: ['$comments.createdAt', 0] }, '$createdAt'] } },
        avgResolutionTime: { $avg: { $cond: [{ $ne: ['$resolvedAt', null] }, { $subtract: ['$resolvedAt', '$createdAt'] }, null] } }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        statusDistribution: {
          new: '$new',
          inProgress: '$inProgress',
          resolved: '$resolved',
          closed: '$closed',
          reopened: '$reopened'
        },
        priorityDistribution: {
          low: '$lowPriority',
          medium: '$mediumPriority',
          high: '$highPriority',
          critical: '$criticalPriority'
        },
        averageResponseTime: '$avgResponseTime',
        averageResolutionTime: '$avgResolutionTime'
      }
    }
  ]);
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
