const mongoose = require('mongoose');

const teacherAttendanceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  employeeId: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'leave'],
    default: 'present'
  },
  checkInTime: {
    type: String,
    default: '08:00 AM'
  },
  checkOutTime: {
    type: String,
    default: '02:30 PM'
  },
  remarks: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Compound unique index per teacher per date
teacherAttendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAttendance', teacherAttendanceSchema);
