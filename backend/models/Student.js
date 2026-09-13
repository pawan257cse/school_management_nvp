const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Academic & Enrollment
  admissionNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  rollNo: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
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
  admissionDate: {
    type: Date,
    default: Date.now
  },
  previousSchool: {
    type: String,
    trim: true,
    default: ''
  },
  tcNumber: {
    type: String,
    trim: true,
    default: ''
  },

  // Personal Details
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  dob: {
    type: Date
  },
  bloodGroup: {
    type: String,
    trim: true,
    default: 'O+'
  },
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    default: 'General'
  },
  religion: {
    type: String,
    default: 'Hindu'
  },
  nationality: {
    type: String,
    default: 'Indian'
  },
  aadhaarNumber: {
    type: String,
    trim: true,
    default: ''
  },
  profilePhoto: {
    type: String,
    default: ''
  },

  // Parents / Guardians
  fatherName: {
    type: String,
    trim: true,
    default: ''
  },
  fatherPhone: {
    type: String,
    trim: true,
    default: ''
  },
  fatherOccupation: {
    type: String,
    trim: true,
    default: ''
  },
  motherName: {
    type: String,
    trim: true,
    default: ''
  },
  motherPhone: {
    type: String,
    trim: true,
    default: ''
  },
  motherOccupation: {
    type: String,
    trim: true,
    default: ''
  },
  guardianName: {
    type: String,
    trim: true,
    default: ''
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent'
  },

  // Address & Contact
  contactNumber: {
    type: String,
    trim: true,
    default: ''
  },
  alternateNumber: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    default: 'Nimbi Jodhan'
  },
  state: {
    type: String,
    default: 'Rajasthan'
  },
  pincode: {
    type: String,
    default: '341316'
  },

  // Transport & Medical
  transportOpted: {
    type: Boolean,
    default: false
  },
  busRoute: {
    type: String,
    default: ''
  },
  medicalNotes: {
    type: String,
    default: 'Normal Health'
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'promoted', 'graduated', 'transferred'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
