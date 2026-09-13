const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  section: { type: String, default: 'A', trim: true },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  studentCount: { type: Number, default: 30 }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
