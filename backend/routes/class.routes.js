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
      .populate('attendanceTeacher', 'name email mobile')
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

// @route   GET /api/classes/my-attendance-classes
// @desc    Get ONLY the classes where current teacher is designated Attendance In-Charge
// @access  Private (TEACHER, PRINCIPAL, HEAD)
router.get('/my-attendance-classes', protect, async (req, res) => {
  try {
    const classSortOrder = ['PG', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

    if (req.user.role === 'HEAD' || req.user.role === 'PRINCIPAL') {
      const classes = await Class.find({ status: 'active' })
        .populate('classTeacher', 'name email mobile')
        .populate('attendanceTeacher', 'name email mobile')
        .populate('subjects', 'name code');

      classes.sort((a, b) => {
        const idxA = classSortOrder.indexOf(a.name);
        const idxB = classSortOrder.indexOf(b.name);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        return a.name.localeCompare(b.name);
      });

      return res.json({ success: true, count: classes.length, classes });
    }

    // For TEACHER role:
    // 1. Permission check: Does teacher have manageAttendance rights?
    if (req.user.permissions && req.user.permissions.manageAttendance === false) {
      return res.json({
        success: true,
        count: 0,
        classes: [],
        permissionDenied: true,
        message: 'You do not have permission to record or view attendance.'
      });
    }

    // 2. Query classes where teacher is designated as classTeacher, attendanceTeacher, or in class lists
    let classes = await Class.find({
      status: 'active',
      $or: [
        { attendanceTeacher: teacherId },
        { classTeacher: teacherId },
        { _id: { $in: req.user.attendanceClasses || [] } },
        { _id: { $in: req.user.assignedClasses || [] } }
      ]
    })
      .populate('classTeacher', 'name email mobile')
      .populate('attendanceTeacher', 'name email mobile')
      .populate('subjects', 'name code');

    classes.sort((a, b) => {
      const idxA = classSortOrder.indexOf(a.name);
      const idxB = classSortOrder.indexOf(b.name);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.name.localeCompare(b.name);
    });

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
    const { name, section, classTeacher, attendanceTeacher, subjects, studentCount } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Class name is required (e.g., 7, Nursery, 10).' });
    }

    const newClass = await Class.create({
      name,
      section: section || 'A',
      classTeacher: classTeacher || null,
      attendanceTeacher: attendanceTeacher || classTeacher || null,
      subjects: subjects || [],
      studentCount: studentCount || 0
    });

    // Auto-sync class teacher's assignedClasses & attendanceClasses
    if (classTeacher) {
      await User.findByIdAndUpdate(classTeacher, { $addToSet: { assignedClasses: newClass._id } });
    }
    if (attendanceTeacher) {
      await User.findByIdAndUpdate(attendanceTeacher, { $addToSet: { attendanceClasses: newClass._id } });
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
    const existingClass = await Class.findById(req.params.id);
    if (!existingClass) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    const oldClassTeacher = existingClass.classTeacher?.toString();
    const oldAttendanceTeacher = existingClass.attendanceTeacher?.toString();

    // If classTeacher is updated and attendanceTeacher not explicitly given, sync attendanceTeacher
    const updatePayload = { ...req.body };
    if (updatePayload.classTeacher && !updatePayload.attendanceTeacher) {
      updatePayload.attendanceTeacher = updatePayload.classTeacher;
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    )
      .populate('classTeacher', 'name email mobile employeeId')
      .populate('attendanceTeacher', 'name email mobile employeeId')
      .populate('subjects');

    // Clean up old class teacher if changed
    if (oldClassTeacher && updatePayload.classTeacher && oldClassTeacher !== updatePayload.classTeacher.toString()) {
      await User.findByIdAndUpdate(oldClassTeacher, { $pull: { assignedClasses: existingClass._id } });
    }
    // Clean up old attendance teacher if changed
    if (oldAttendanceTeacher && updatePayload.attendanceTeacher && oldAttendanceTeacher !== updatePayload.attendanceTeacher.toString()) {
      await User.findByIdAndUpdate(oldAttendanceTeacher, { $pull: { attendanceClasses: existingClass._id } });
    }

    // Add to new class teacher
    if (updatePayload.classTeacher) {
      await User.findByIdAndUpdate(updatePayload.classTeacher, { $addToSet: { assignedClasses: updatedClass._id } });
    }
    // Add to new attendance teacher
    if (updatePayload.attendanceTeacher) {
      await User.findByIdAndUpdate(updatePayload.attendanceTeacher, { $addToSet: { attendanceClasses: updatedClass._id } });
    }

    await logActivity(req, 'EDIT_CLASS', 'Class', updatedClass._id, { 
      name: updatedClass.name,
      classTeacher: updatedClass.classTeacher?.name,
      attendanceTeacher: updatedClass.attendanceTeacher?.name
    });

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
