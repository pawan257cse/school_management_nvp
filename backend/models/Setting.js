const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  schoolName: { type: String, default: 'NVP ENGLISH MEDIUM SCHOOL' },
  subtitle: { type: String, default: 'NIMBI JODHAN' },
  address: { type: String, default: 'Nimbi Jodhan, Ladnun, Nagaur, Rajasthan 341316' },
  contactNumber: { type: String, default: '+91 98290 12345' },
  email: { type: String, default: 'info@nvpschool.edu.in' },
  academicSession: { type: String, default: '2026-2027' },
  examTypes: [{ type: String }],
  defaultMarks: { type: Number, default: 100 },
  defaultDuration: { type: Number, default: 90 },
  passwordPolicy: {
    minLength: { type: Number, default: 8 },
    requireSpecialChar: { type: Boolean, default: true },
    requireNumber: { type: Boolean, default: true }
  },
  sessionTimeout: { type: Number, default: 24 },
  motto: { type: String, default: 'Excellence in Education, Character in Leadership' },
  affiliation: { type: String, default: 'CBSE Affiliated - Secondary & Sr. Secondary' },
  logoUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
