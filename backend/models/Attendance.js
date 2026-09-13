const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  status: {
    type: String,
    enum: ['present', 'absent', 'leave'],
    default: 'present'
  }
});

const attendanceSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  records: [attendanceRecordSchema]
}, { timestamps: true });

// Compound index so a class has unique attendance record per date
attendanceSchema.index({ class: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
