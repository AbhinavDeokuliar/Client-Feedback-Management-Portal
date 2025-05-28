const mongoose = require('mongoose');

const exportLogSchema = new mongoose.Schema({
  exportType: {
    type: String,
    required: [true, 'Export type is required'],
    enum: {
      values: ['excel', 'csv'],
      message: 'Export type must be excel or csv'
    },
    default: 'excel'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User information is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  status: {
    type: String,
    enum: {
      values: ['processing', 'completed', 'failed'],
      message: 'Status must be processing, completed, or failed'
    },
    default: 'processing'
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  error: {
    type: String
  },
  completedAt: {
    type: Date
  },
  fileSize: {
    type: Number
  },
  recordCount: {
    type: Number
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
exportLogSchema.index({ generatedBy: 1 });
exportLogSchema.index({ status: 1 });
exportLogSchema.index({ createdAt: 1 });

// Pre-find middleware to populate user info
exportLogSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'generatedBy',
    select: 'name email'
  });
  next();
});

const ExportLog = mongoose.model('ExportLog', exportLogSchema);

module.exports = ExportLog;

