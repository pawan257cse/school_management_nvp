const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const { protect } = require('../middleware/auth');
const { logActivity } = require('../middleware/auditLogger');
const { getTeacherClassIds, getTeacherAttendanceClassIds } = require('../utils/teacherScope');

// @route   GET /api/attendance
// @desc    Get attendance record for class and date
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { classId, date } = req.query;

    if (!classId) {
      return res.status(400).json({ success: false, message: 'Class ID is required.' });
    }

    if (req.user.role === 'TEACHER') {
      const allowedClassIds = await getTeacherAttendanceClassIds(req.user);
      if (!allowedClassIds.includes(classId.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not designated as the Attendance In-Charge for this class.'
        });
      }
    }

    const searchDate = date ? new Date(date) : new Date();
    searchDate.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({ class: classId, date: searchDate })
      .populate('teacher', 'name email')
      .populate('class', 'name section studentCount');

    if (!attendance) {
      const Student = require('../models/Student');
      const classStudents = await Student.find({ class: classId, status: 'active' }).sort({ rollNo: 1 });

      let defaultRecords = [];
      if (classStudents && classStudents.length > 0) {
        defaultRecords = classStudents.map(s => ({
          rollNo: s.rollNo ? String(s.rollNo) : '1',
          studentName: s.name,
          status: 'present'
        }));
      } else {
        // No students enrolled yet in this class - do not invent fake students
        defaultRecords = [];
      }

      return res.json({
        success: true,
        exists: false,
        attendance: {
          class: classId,
          date: searchDate,
          records: defaultRecords
        }
      });
    }

    res.json({ success: true, exists: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/attendance
// @desc    Save/Update class attendance
// @access  Private (TEACHER, PRINCIPAL, HEAD)
router.post('/', protect, async (req, res) => {
  try {
    const { classId, date, records } = req.body;

    if (!classId || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Class ID and student records array are required.' });
    }

    if (req.user.role === 'TEACHER') {
      const allowedClassIds = await getTeacherAttendanceClassIds(req.user);
      if (!allowedClassIds.includes(classId.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are not designated as the Attendance In-Charge for this class.'
        });
      }
    }

    const recordDate = date ? new Date(date) : new Date();
    recordDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      { class: classId, date: recordDate },
      {
        teacher: req.user._id,
        records
      },
      { new: true, upsert: true, runValidators: true }
    );

    await logActivity(req, 'UPDATE_ATTENDANCE', 'Attendance', attendance._id, {
      classId,
      presentCount: records.filter(r => r.status === 'present').length,
      absentCount: records.filter(r => r.status === 'absent').length
    });

    res.json({ success: true, message: 'Attendance recorded successfully.', attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
