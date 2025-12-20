const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  // === CORE FIELDS (existing) ===
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // === NEW: FILE & CONTENT METADATA ===
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'ppt', 'image', 'video', 'other'],
    required: true,
    lowercase: true
  },
  category: {
    type: String,
    enum: ['notes', 'assignments', 'previous-papers', 'lab-manual', 'syllabus', 'other'],
    required: true,
    lowercase: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 8,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },

  // === MODERATION & OWNERSHIP ===
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    lowercase: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // === ENGAGEMENT METRICS ===
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 0 and 5'
    }
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  }

}, {
  timestamps: true
});

// === COMPOUND TEXT INDEX FOR SEARCH ===
resourceSchema.index({
  title: 'text',
  description: 'text',
  subject: 'text',
  tags: 'text'
});

// === INDEXES FOR PERFORMANCE ===
resourceSchema.index({ department: 1, semester: 1 });
resourceSchema.index({ status: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ fileType: 1, category: 1 });

// === VIRTUAL: Average Rating ===
resourceSchema.virtual('averageRating').get(function() {
  return this.ratingCount > 0 ? (this.rating / this.ratingCount).toFixed(1) : 0;
});

// === METHOD: Increment views ===
resourceSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// === METHOD: Increment downloads ===
resourceSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// === METHOD: Add rating (1-5) ===
resourceSchema.methods.addRating = function(ratingValue) {
  if (ratingValue < 1 || ratingValue > 5 || !Number.isInteger(ratingValue)) {
    throw new Error('Rating must be an integer between 1 and 5');
  }
  this.rating += ratingValue;
  this.ratingCount += 1;
  return this.save();
};

module.exports = mongoose.model('Resource', resourceSchema);