const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['mcq', 'fill_blanks', 'true_false', 'match', 'short', 'long', 'very_short'],
    required: true
  },
  marks: { type: Number, default: 1 },
  options: [{ type: String }],
  matchPairs: [{
    left: { type: String },
    right: { type: String }
  }],
  answer: { type: String, default: '' },
  questionImage: { type: String, default: '' }, // Diagram / Figure image URL
  section: { type: String, default: 'Section A' }, // Section grouping e.g. Section A, Section B
  reorderIndex: { type: Number, default: 0 }
});

const questionPaperSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  examType: { type: String, required: true },
  session: { type: String, default: '2026-2027' },
  examDate: { type: Date, default: Date.now },
  duration: { type: Number, default: 90 },
  totalMarks: { type: Number, default: 100 },
  language: { type: String, enum: ['English', 'Hindi', 'Bilingual'], default: 'English' },
  paperMode: { type: String, enum: ['builder', 'upload'], default: 'builder' },
  uploadedFileUrl: { type: String, default: '' },
  uploadedFileType: { type: String, default: '' },
  instructions: [{ type: String }],
  questions: [questionSchema],
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  rejectionReason: { type: String, default: '' },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('QuestionPaper', questionPaperSchema);
