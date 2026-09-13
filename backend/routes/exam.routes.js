const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get all exams
router.get('/', protect, async (req, res) => {
  try {
    const { status, academicYear } = req.query;
    const query = {};

    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const exams = await Exam.find(query)
      .populate('classes', 'name section')
      .sort({ startDate: 1 });

    res.json({ success: true, count: exams.length, exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new exam
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { name, examType, academicYear, startDate, endDate, classes, description, status } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Exam Name, Start Date and End Date are required.' });
    }

    const exam = await Exam.create({
      name,
      examType: examType || 'Term Exam',
      academicYear: academicYear || '2026-2027',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      classes: classes || [],
      description: description || '',
      status: status || 'upcoming',
      published: true
    });

    const populatedExam = await Exam.findById(exam._id).populate('classes', 'name section');
    res.status(201).json({ success: true, message: 'Exam scheduled successfully.', exam: populatedExam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update exam
router.put('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('classes', 'name section');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }
    res.json({ success: true, message: 'Exam updated successfully.', exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete exam
router.delete('/:id', protect, checkRole('HEAD'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }
    res.json({ success: true, message: 'Exam deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
