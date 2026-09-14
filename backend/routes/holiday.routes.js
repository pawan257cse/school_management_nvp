const express = require('express');
const router = express.Router();
const Holiday = require('../models/Holiday');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Helper to get current Indian Standard Time (IST) date string in YYYY-MM-DD
const getTodayISTString = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

// @route   GET /api/holidays
// @desc    Get all school holidays (sorted by date)
// @access  Private (All authenticated users: Student, Teacher, Head, Principal, Parent)
router.get('/', protect, async (req, res) => {
  try {
    const holidays = await Holiday.find()
      .populate('createdBy', 'name role')
      .sort({ date: 1 });

    const todayStr = getTodayISTString();

    // Check if today matches any holiday
    const todayHoliday = holidays.find(h => {
      const hDate = h.date ? h.date.split('T')[0].trim() : '';
      const hEnd = h.endDate ? h.endDate.split('T')[0].trim() : '';
      if (hDate === todayStr) return true;
      if (hEnd && todayStr >= hDate && todayStr <= hEnd) return true;
      return false;
    }) || null;

    res.json({
      success: true,
      todayStr,
      todayHoliday: todayHoliday ? {
        _id: todayHoliday._id,
        title: todayHoliday.title,
        date: todayHoliday.date,
        endDate: todayHoliday.endDate,
        description: todayHoliday.description,
        type: todayHoliday.type
      } : null,
      holidays
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/holidays
// @desc    Create a new school holiday (Head / Principal only)
// @access  Private (HEAD, PRINCIPAL)
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { title, date, endDate, description, type, academicYear } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Holiday title and date are required.' });
    }

    const newHoliday = await Holiday.create({
      title: title.trim(),
      date: date.trim(),
      endDate: endDate ? endDate.trim() : null,
      description: description ? description.trim() : '',
      type: type || 'FESTIVAL',
      academicYear: academicYear || '2026-2027',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'School holiday declared successfully.',
      holiday: newHoliday
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/holidays/:id
// @desc    Update a school holiday (Head / Principal only)
// @access  Private (HEAD, PRINCIPAL)
router.put('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { title, date, endDate, description, type, academicYear } = req.body;

    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday record not found.' });
    }

    if (title) holiday.title = title.trim();
    if (date) holiday.date = date.trim();
    if (endDate !== undefined) holiday.endDate = endDate ? endDate.trim() : null;
    if (description !== undefined) holiday.description = description.trim();
    if (type) holiday.type = type;
    if (academicYear) holiday.academicYear = academicYear;

    await holiday.save();

    res.json({
      success: true,
      message: 'Holiday updated successfully.',
      holiday
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/holidays/:id
// @desc    Delete a school holiday (Head / Principal only)
// @access  Private (HEAD, PRINCIPAL)
router.delete('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);
    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday record not found.' });
    }

    await Holiday.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Holiday deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
