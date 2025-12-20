const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  // === CORE IDENTIFIERS ===
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    unique: true,
    minlength: 2,
    maxlength: 10,
    match: /^[A-Z0-9]+$/
  },

  // === LOCATION ===
  building: {
    type: String,
    trim: true
  },
  floor: {
    type: Number,
    min: 0,
    max: 10
  },
  roomNumbers: [{
    type: String,
    trim: true
  }],

  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  mapLink: {
    type: String,
    trim: true
  },
  photo360Link: {
    type: String,
    trim: true
  },

  // === CONTACT INFO ===
  contact: {
    phone: {
      type: String,
      trim: true,
      match: /^[\d\+\-\s\(\)]+$/
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    office: {
      type: String,
      trim: true
    }
  },

  // === HOD DETAILS ===
  hod: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    cabin: {
      type: String,
      trim: true
    }
  },

  // === VISITING HOURS ===
  visitingHours: {
    weekdays: {
      open: { type: String, trim: true },
      close: { type: String, trim: true }
    },
    saturday: {
      open: { type: String, trim: true },
      close: { type: String, trim: true }
    },
    closedDays: [{
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      trim: true
    }]
  },

  // === MEDIA ===
  photos: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    }
  }],

  // === ANALYTICS ===
  searchCount: {
    type: Number,
    default: 0,
    min: 0
  },

  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// === TEXT INDEX FOR FAST SEARCH ===
departmentSchema.index({ name: 'text', code: 'text' });

// === COMPOUND INDEX FOR PERFORMANCE ===
departmentSchema.index({ code: 1 });
departmentSchema.index({ latitude: 1, longitude: 1 });

// === INCREMENT SEARCH COUNT METHOD ===
departmentSchema.methods.incrementSearch = function() {
  this.searchCount += 1;
  return this.save();
};

module.exports = mongoose.model('Department', departmentSchema);