const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBook', required: true },
  bookTitle: { type: String, required: true },
  bookCode: { type: String, required: true },
  borrowerType: { type: String, enum: ['STUDENT', 'TEACHER'], required: true },
  borrowerRef: { type: mongoose.Schema.Types.ObjectId, required: true },
  borrowerName: { type: String, required: true },
  borrowerDetail: { type: String, default: '' }, // e.g. Class 5 (A) or EmpID
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date, default: null },
  fineAmount: { type: Number, default: 0 },
  remarks: { type: String, default: '' },
  status: { type: String, enum: ['ISSUED', 'RETURNED', 'OVERDUE'], default: 'ISSUED' },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('BookIssue', bookIssueSchema);
