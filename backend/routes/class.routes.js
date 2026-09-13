const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { logActivity } = require('../middleware/auditLogger');
const { getTeacherClassIds } = require('../utils/teacherScope');

// @route   GET /api/classes
// @desc    Get all classes (Filtered strictly to assigned classes for TEACHER)
// @access  Private (All roles)
router.get('/', protect, async (req, res) => {
  try {
    let classes = await Class.find({ status: 'active' })
      .populate('classTeacher', 'name email mobile')
      .populate('subjects', 'name code')
      .sort({ name: 1 });

    // Restrict teachers strictly to their assigned classes
    if (req.user.role === 'TEACHER') {
      const allowedClassIds = await getTeacherClassIds(req.user);
      classes = classes.filter(c => allowedClassIds.includes(c._id.toString()));
    }

    res.json({ success: true, count: classes.length, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/classes
// @desc    Add new Class
// @access  Private (HEAD, PRINCIPAL)
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { name, section, classTeacher, subjects, studentCount } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Class name is required (e.g., 7, Nursery, 10).' });
    }

    const newClass = await Class.create({
      name,
      section: section || 'A',
      classTeacher: classTeacher || null,
      subjects: subjects || [],
      studentCount: studentCount || 30
    });

    // Auto-sync class teacher's assignedClasses
    if (classTeacher) {
      await User.findByIdAndUpdate(classTeacher, { $addToSet: { assignedClasses: newClass._id } });
    }

    await logActivity(req, 'CREATE_CLASS', 'Class', newClass._id, { name: newClass.name });

    res.status(201).json({ success: true, message: 'Class created successfully.', class: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/classes/:id
// @desc    Update class details
// @access  Private (HEAD, PRINCIPAL)
router.put('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('classTeacher').populate('subjects');

    if (!updatedClass) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    // Auto-sync class teacher's assignedClasses
    if (req.body.classTeacher) {
      await User.findByIdAndUpdate(req.body.classTeacher, { $addToSet: { assignedClasses: updatedClass._id } });
    }

    await logActivity(req, 'EDIT_CLASS', 'Class', updatedClass._id, { name: updatedClass.name });

    res.json({ success: true, message: 'Class updated successfully.', class: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private (HEAD, PRINCIPAL)
router.delete('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.id);
    if (!deletedClass) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    await logActivity(req, 'DELETE_CLASS', 'Class', req.params.id);

    res.json({ success: true, message: 'Class deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
