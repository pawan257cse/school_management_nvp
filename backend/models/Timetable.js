const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  periodNumber: {
    type: Number,
    required: true
  },
  periodTitle: {
    type: String,
    default: 'Period'
  },
  isBreak: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: String,
    required: true,
    trim: true
  },
  endTime: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  subjectName: {
    type: String,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  teacherName: {
    type: String,
    trim: true
  },
  roomNo: {
    type: String,
    default: 'Room 101',
    trim: true
  }
});

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  periods: [periodSchema]
});

const timetableSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  className: {
    type: String,
    required: true
  },
  section: {
    type: String,
    default: 'A'
  },
  academicYear: {
    type: String,
    default: '2026-2027'
  },
  schedule: [dayScheduleSchema]
}, { timestamps: true });

// Ensure unique timetable per class and academicYear
timetableSchema.index({ class: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
