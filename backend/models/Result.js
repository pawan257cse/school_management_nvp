const mongoose = require('mongoose');

const studentResultSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  obtainedMarks: { type: Number, required: true, default: 0 },
  percentage: { type: Number, default: 0 },
  grade: { type: String, default: 'F' },
  passStatus: { type: String, enum: ['pass', 'fail'], default: 'pass' }
});

const resultSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: String, required: true },
  totalMarks: { type: Number, default: 100 },
  records: [studentResultSchema]
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
