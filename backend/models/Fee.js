const mongoose = require('mongoose');

// Class Fee Structure Schema
const feeStructureSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  className: {
    type: String,
    required: true
  },
  section: {
    type: String,
    default: 'A'
  },
  academicYear: {
    type: String,
    default: '2026-2027',
    required: true
  },
  feeHeads: [{
    headName: { type: String, required: true }, // e.g. Tuition Fee, Admission Fee, Exam Fee, Computer Fee, Transport Fee
    amount: { type: Number, required: true, default: 0 },
    frequency: { type: String, enum: ['Annual', 'Quarterly', 'Monthly', 'One-Time'], default: 'Annual' }
  }],
  totalBaseFee: {
    type: Number,
    required: true,
    default: 0
  },
  installments: [{
    installmentNo: { type: Number, required: true },
    title: { type: String, required: true }, // e.g. Installment 1
    dueDate: { type: Date },
    amount: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

// Student Fee Discount Schema
const feeDiscountSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  academicYear: {
    type: String,
    default: '2026-2027'
  },
  discountAmount: {
    type: Number,
    required: true,
    default: 0
  },
  reason: {
    type: String,
    default: 'Merit / Need-Based Scholarship'
  },
  authorizedBy: {
    type: String,
    default: 'Head Administrator'
  }
}, { timestamps: true });

// Fee Payment Receipt Schema
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
  admissionNo: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    required: true
  },
  section: {
    type: String,
    default: 'A'
  },
  academicYear: {
    type: String,
    default: '2026-2027'
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
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online Payment'],
    default: 'Cash'
  },
  transactionRefNo: {
    type: String,
    default: ''
  },
  previousBalance: {
    type: Number,
    default: 0
  },
  remainingBalance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed', 'Cancelled'],
    default: 'Completed'
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  },
  receivedBy: {
    type: String,
    default: 'Accounts Section'
  }
}, { timestamps: true });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
const FeeDiscount = mongoose.model('FeeDiscount', feeDiscountSchema);
const FeePayment = mongoose.model('FeePayment', feePaymentSchema);

module.exports = { FeeStructure, FeeDiscount, FeePayment };
