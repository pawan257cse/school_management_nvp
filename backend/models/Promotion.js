const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  fromClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  fromClassName: {
    type: String,
    required: true
  },
  toClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  toClassName: {
    type: String,
    required: true
  },
  academicYearFrom: {
    type: String,
    required: true
  },
  academicYearTo: {
    type: String,
    required: true
  },
  promotedCount: {
    type: Number,
    required: true,
    default: 0
  },
  students: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    studentName: String,
    rollNo: String,
    status: { type: String, enum: ['Promoted', 'Retained', 'Graduated'], default: 'Promoted' }
  }],
  promotionDate: {
    type: Date,
    default: Date.now
  },
  remarks: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
