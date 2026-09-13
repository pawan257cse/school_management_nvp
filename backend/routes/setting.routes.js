const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { logActivity } = require('../middleware/auditLogger');

// @route   GET /api/settings
// @desc    Get system settings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        schoolName: 'NVP ENGLISH MEDIUM SCHOOL',
        subtitle: 'NIMBI JODHAN',
        address: 'Nimbi Jodhan, Ladnun, Nagaur, Rajasthan 341316',
        contactNumber: '+91 98290 12345',
        email: 'info@nvpschool.edu.in',
        academicSession: '2026-2027',
        examTypes: ['Unit Test I', 'Unit Test II', 'Half Yearly Exam', 'Final Annual Exam'],
        defaultMarks: 100,
        defaultDuration: 90
      });
    }

    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/settings
// @desc    Update system settings
// @access  Private (HEAD only)
router.put('/', protect, checkRole('HEAD'), async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();
    await logActivity(req, 'SYSTEM_SETTING_CHANGE', 'Setting', settings._id);

    res.json({ success: true, message: 'Settings updated successfully.', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
