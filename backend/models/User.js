const mongoose = require('mongoose');

const defaultPermissions = {
  viewTeachers: true,
  addTeachers: true,
  editTeachers: true,
  deleteTeachers: true,
  resetPassword: true,
  manageClasses: true,
  manageSubjects: true,
  createQuestionPapers: true,
  approveQuestionPapers: true,
  createAssignments: true,
  manageAttendance: true,
  manageResults: true,
  uploadStudyMaterial: true,
  viewReports: true,
  manageNotifications: true
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },

  // Stores the plain-text generated/reset password — ONLY visible to HEAD/PRINCIPAL
  // This is the "current temporary password" shown in credentials panel
  // Gets cleared when user changes their own password
  generatedPassword: { type: String, default: '' },

  role: { type: String, enum: ['HEAD', 'PRINCIPAL', 'TEACHER', 'STUDENT'], required: true },
  mobile: { type: String, trim: true },
  employeeId: { type: String, trim: true },
  admissionNo: { type: String, trim: true },
  studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  qualification: { type: String, default: 'M.Sc., B.Ed.' },
  joiningDate: { type: Date, default: Date.now },
  profilePhoto: { type: String, default: '' },
  assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  assignedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  mustChangePassword: { type: Boolean, default: true },
  permissions: {
    type: Map,
    of: Boolean,
    default: defaultPermissions
  },
  lastLogin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
