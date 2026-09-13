const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  assignmentDate: { type: Date, default: Date.now },
  submissionDate: { type: Date, required: true },
  instructions: { type: String, default: '' },
  attachments: [{ type: String }],
  status: {
    type: String,
    enum: ['draft', 'published', 'unpublished'],
    default: 'published'
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
