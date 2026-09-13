const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { logActivity } = require('../middleware/auditLogger');

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let subjects = await Subject.find({ status: 'active' }).sort({ name: 1 });

    if (req.user.role === 'TEACHER') {
      const assignedIds = (req.user.assignedSubjects || []).map(s => (s._id || s).toString());
      subjects = subjects.filter(s => assignedIds.includes(s._id.toString()));
    }

    res.json({ success: true, count: subjects.length, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/subjects
// @desc    Create subject
// @access  Private (HEAD, PRINCIPAL)
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Subject name and code are required.' });
    }

    const newSubject = await Subject.create({
      name,
      code: code.toUpperCase()
    });

    await logActivity(req, 'CREATE_SUBJECT', 'Subject', newSubject._id, { name: newSubject.name });

    res.status(201).json({ success: true, message: 'Subject created successfully.', subject: newSubject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private (HEAD, PRINCIPAL)
router.put('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await logActivity(req, 'EDIT_SUBJECT', 'Subject', updatedSubject._id, { name: updatedSubject.name });

    res.json({ success: true, message: 'Subject updated successfully.', subject: updatedSubject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete subject
// @access  Private (HEAD, PRINCIPAL)
router.delete('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
    if (!deletedSubject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await logActivity(req, 'DELETE_SUBJECT', 'Subject', req.params.id);

    res.json({ success: true, message: 'Subject deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
