const express = require('express');
const router = express.Router();
const TeacherAttendance = require('../models/TeacherAttendance');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get teacher attendance for a specific date
router.get('/', protect, async (req, res) => {
  try {
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const teachers = await User.find({ role: 'TEACHER', status: 'active' })
      .populate('assignedClasses', 'name section')
      .populate('assignedSubjects', 'name');

    const attendanceRecords = await TeacherAttendance.find({
      date: { $gte: targetDate, $lt: nextDay }
    });

    const attendanceMap = {};
    attendanceRecords.forEach(att => {
      attendanceMap[att.teacher.toString()] = att;
    });

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;

    const teacherRoster = teachers.map(t => {
      const existing = attendanceMap[t._id.toString()];
      const status = existing ? existing.status : 'present'; // default present if not marked
      const checkInTime = existing ? existing.checkInTime : '07:55 AM';
      const checkOutTime = existing ? existing.checkOutTime : '02:30 PM';
      const remarks = existing ? existing.remarks : 'Academic Duty';

      if (status === 'present') presentCount++;
      else if (status === 'absent') absentCount++;
      else if (status === 'late') lateCount++;
      else if (['leave', 'half-day'].includes(status)) leaveCount++;

      return {
        teacherId: t._id,
        name: t.name,
        email: t.email,
        employeeId: t.employeeId,
        mobile: t.mobile,
        assignedClasses: t.assignedClasses,
        assignedSubjects: t.assignedSubjects,
        classes: (t.assignedClasses || []).map(c => `Class ${c.name}`).join(', ') || 'General',
        subjects: (t.assignedSubjects || []).map(s => s.name).join(', ') || 'All',
        status,
        checkInTime,
        checkOutTime,
        remarks,
        attendanceId: existing ? existing._id : null
      };
    });

    const summaryData = {
      totalTeachers: teachers.length,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      leave: leaveCount
    };

    res.json({
      success: true,
      date: targetDate,
      summary: summaryData,
      roster: teacherRoster,
      teachers: teacherRoster,
      data: {
        date: targetDate,
        summary: summaryData,
        roster: teacherRoster,
        teachers: teacherRoster
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save or Update Attendance for Teachers
router.post('/save', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Date and records array are required.' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    for (const item of records) {
      await TeacherAttendance.findOneAndUpdate(
        { teacher: item.teacherId, date: targetDate },
        {
          teacher: item.teacherId,
          teacherName: item.name,
          employeeId: item.employeeId,
          date: targetDate,
          status: item.status || 'present',
          checkInTime: item.checkInTime || '08:00 AM',
          checkOutTime: item.checkOutTime || '02:30 PM',
          remarks: item.remarks || ''
        },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: 'Teacher attendance recorded successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
