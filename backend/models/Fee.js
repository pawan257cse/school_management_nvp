const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  feeType: {
    type: String,
    enum: ['Tuition', 'Admission', 'Transport', 'Exam', 'Laboratory', 'Activity'],
    default: 'Tuition'
  },
  frequency: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annually'],
    default: 'Quarterly'
  },
  academicYear: {
    type: String,
    default: '2026-2027'
  }
}, { timestamps: true });

const feePaymentSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  feeType: {
    type: String,
    default: 'Tuition Fee'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Net Banking', 'Cheque', 'Card'],
    default: 'Cash'
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    default: 'Completed'
  },
  remarks: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
const FeePayment = mongoose.model('FeePayment', feePaymentSchema);

module.exports = { FeeStructure, FeePayment };
