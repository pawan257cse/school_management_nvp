const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Holiday title is required'],
    trim: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD (e.g., '2026-10-20')
    required: [true, 'Holiday start date is required'],
    trim: true
  },
  endDate: {
    type: String, // Format: YYYY-MM-DD (e.g., '2026-10-25' for multi-day vacation)
    default: null,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: String,
    enum: ['FESTIVAL', 'NATIONAL', 'VACATION', 'GOVERNMENT', 'SPECIAL', 'OTHER'],
    default: 'FESTIVAL'
  },
  academicYear: {
    type: String,
    default: '2026-2027'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for fast date lookups
holidaySchema.index({ date: 1, endDate: 1 });

module.exports = mongoose.model('Holiday', holidaySchema);
