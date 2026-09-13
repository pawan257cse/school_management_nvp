const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  section: {
    type: String,
    default: 'A'
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent'
  },
  guardianName: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'promoted', 'graduated'],
    default: 'active'
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  bloodGroup: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
