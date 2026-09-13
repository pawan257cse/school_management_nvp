const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Timetable = require('../models/Timetable');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const { FeeStructure, FeePayment } = require('../models/Fee');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const Announcement = require('../models/Announcement');
const Holiday = require('../models/Holiday');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Helper to get student record for current user
// Priority: studentRef > admissionNo > email match
// NOTE: We do NOT fall back to Student.findOne() (random student) - that would show wrong data
const getStudentForUser = async (user) => {
  if (user.studentRef) {
    const s = await Student.findById(user.studentRef).populate('class');
    if (s) return s;
  }
  if (user.admissionNo) {
    const s = await Student.findOne({ admissionNo: user.admissionNo }).populate('class');
    if (s) return s;
  }
  if (user.email) {
    const s = await Student.findOne({ email: user.email }).populate('class');
    if (s) return s;
  }
  // For HEAD/PRINCIPAL preview mode - return null (handled per route)
  return null;
};

const getDefaultAssignments = (className = 'Class 6') => {
  const today = new Date();
  const getDue = (days) => {
    const d = new Date();
    d.setDate(today.getDate() + days);
    return d;
  };

  return [
    {
      _id: 'hw-skt-01',
      id: 'hw-skt-01',
      title: 'Sanskrit: Chapter 3 - Word Meanings and Shlokas Recitation',
      subject: { name: 'Sanskrit', code: 'SKT' },
      subjectName: 'Sanskrit',
      teacher: { name: 'Dr. Dinesh Sharma' },
      teacherName: 'Dr. Dinesh Sharma',
      description: 'Complete workbook pages 24 to 28 in neat handwriting and memorize Subhashitani shlokas 1-4.',
      instructions: '1. Practice daily neat handwriting.\n2. Memorize word meanings and write in notebook.\n3. Oral recitation will be conducted tomorrow in class.',
      submissionDate: getDue(1),
      dueDate: getDue(1),
      assignmentDate: today,
      status: 'published',
      type: 'Daily Homework',
      priority: 'High',
      attachments: []
    },
    {
      _id: 'hw-mth-02',
      id: 'hw-mth-02',
      title: 'Mathematics: Chapter 4 - Fractions & Decimals Word Problems',
      subject: { name: 'Mathematics', code: 'MATH' },
      subjectName: 'Mathematics',
      teacher: { name: 'Mr. Rahul Sharma' },
      teacherName: 'Mr. Rahul Sharma',
      description: 'Solve Exercise 4.2 Questions 1 to 12 in the Math Fair Notebook with full calculation steps and diagrams.',
      instructions: 'Draw neat number lines for questions 7 and 9 with pencil and ruler. Practice LCM calculation without calculator.',
      submissionDate: getDue(2),
      dueDate: getDue(2),
      assignmentDate: today,
      status: 'published',
      type: 'Daily Homework',
      priority: 'High',
      attachments: []
    },
    {
      _id: 'hw-sci-03',
      id: 'hw-sci-03',
      title: 'Science: Diagram of Plant Cell & Photosynthesis Cycle',
      subject: { name: 'Science', code: 'SCI' },
      subjectName: 'Science',
      teacher: { name: 'Mrs. Priya Verma' },
      teacherName: 'Mrs. Priya Verma',
      description: 'Draw and color the diagram of a typical Plant Cell on an A4 sheet. Label all 8 organelles clearly.',
      instructions: 'Write 2 lines about the function of Chloroplast and Mitochondria. Bring it in your science file.',
      submissionDate: getDue(3),
      dueDate: getDue(3),
      assignmentDate: today,
      status: 'published',
      type: 'Project Work',
      priority: 'Medium',
      attachments: []
    },
    {
      _id: 'hw-eng-04',
      id: 'hw-eng-04',
      title: 'English: Grammar Tenses Worksheet & Story Composition',
      subject: { name: 'English', code: 'ENG' },
      subjectName: 'English',
      teacher: { name: 'Ms. Sunita Roy' },
      teacherName: 'Ms. Sunita Roy',
      description: 'Complete the Active-Passive voice worksheet (15 sentences) and write a short paragraph on "A Rainy Day in My Village" (120 words).',
      instructions: 'Check spelling and punctuation carefully. Highlight new vocabulary words with an underline.',
      submissionDate: getDue(2),
      dueDate: getDue(2),
      assignmentDate: today,
      status: 'published',
      type: 'Daily Homework',
      priority: 'Medium',
      attachments: []
    },
    {
      _id: 'hw-sst-05',
      id: 'hw-sst-05',
      title: 'Social Science: India Physical Map - Major River Basins',
      subject: { name: 'Social Science', code: 'SST' },
      subjectName: 'Social Science',
      teacher: { name: 'Mr. Arvind Singh' },
      teacherName: 'Mr. Arvind Singh',
      description: 'Mark and color Ganga, Yamuna, Brahmaputra, Narmada and Godavari rivers on the physical map of India.',
      instructions: 'Paste the map in your Social Science practical notebook and write capitals of 5 states.',
      submissionDate: getDue(4),
      dueDate: getDue(4),
      assignmentDate: today,
      status: 'published',
      type: 'Map Activity',
      priority: 'Normal',
      attachments: []
    },
    {
      _id: 'hw-hin-06',
      id: 'hw-hin-06',
      title: 'Hindi: Chapter - Vah Chidiya Jo (Poem Central Idea & Meanings)',
      subject: { name: 'Hindi', code: 'HIN' },
      subjectName: 'Hindi',
      teacher: { name: 'Dr. Manju Sharma' },
      teacherName: 'Dr. Manju Sharma',
      description: 'Write the central idea of the first two stanzas in your own words and learn synonyms of new vocabulary words.',
      instructions: 'Complete the exercise work in neat and clean handwriting.',
      submissionDate: getDue(1),
      dueDate: getDue(1),
      assignmentDate: today,
      status: 'published',
      type: 'Daily Homework',
      priority: 'High',
      attachments: []
    }
  ];
};

// @route   GET /api/student-portal/dashboard
// @desc    Get complete mTOP style student dashboard with live class tracker, attendance, assignments & exams
// @access  Private (STUDENT, HEAD, PRINCIPAL)
router.get('/dashboard', protect, async (req, res) => {
  try {
    const student = await getStudentForUser(req.user);
    if (!student) {
      // HEAD/PRINCIPAL can preview the page but won't have a student record
      if (req.user.role === 'HEAD' || req.user.role === 'PRINCIPAL') {
        return res.json({
          success: true,
          previewMode: true,
          student: { name: req.user.name, className: 'Admin Preview', section: '-', admissionNo: 'N/A', rollNo: 'N/A', gender: 'Male', guardianName: '-', contactNumber: '-', bloodGroup: '-' },
          liveSchedule: { todayName: 'Monday', currentPeriod: null, nextPeriod: null, todayPeriods: [] },
          attendance: { percentage: 0, presentCount: 0, absentCount: 0, leaveCount: 0, totalDays: 0, today: { status: 'not-marked', statusLabel: 'Admin View', markedByTeacher: '' } },
          fees: { expectedFee: 0, paidFee: 0, pendingDues: 0, status: 'N/A' },
          assignments: [],
          exams: [],
          notices: []
        });
      }
      return res.status(404).json({ success: false, message: 'Student profile not linked to this user account. Please contact the school admin to link your admission number.' });
    }

    const classId = student.class?._id || student.class;

    // 1. Get Timetable for student's class
    const timetable = await Timetable.findOne({ class: classId })
      .populate('schedule.periods.subject', 'name')
      .populate('schedule.periods.teacher', 'name mobile');


    // Fetch School Holidays
    const holidays = await Holiday.find().sort({ date: 1 });
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const todayStr = istDate.toISOString().split('T')[0];
    const isSunday = now.getDay() === 0;

    const todayHoliday = holidays.find(h => {
      if (h.date === todayStr) return true;
      if (h.endDate && todayStr >= h.date && todayStr <= h.endDate) return true;
      return false;
    }) || null;

    // Get Today's day name (e.g. "Monday", "Tuesday", etc.)
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = daysMap[now.getDay()] === 'Sunday' ? 'Monday' : daysMap[now.getDay()];

    const todaySchedule = timetable?.schedule?.find(s => s.day === currentDayName);
    const todayPeriods = todaySchedule?.periods || [];

    // Format current time into minutes for active period calculation
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Helper to parse time strings like "08:00 AM", "01:30 PM" into minutes from midnight
    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [time, modifier] = timeStr.trim().split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    };

    let currentPeriod = null;
    let nextPeriod = null;

    const formattedPeriods = todayPeriods.map((p, idx) => {
      const startMin = parseTimeToMinutes(p.startTime);
      const endMin = parseTimeToMinutes(p.endTime);
      let status = 'upcoming';

      if (currentTotalMinutes >= startMin && currentTotalMinutes <= endMin) {
        status = 'in-progress';
        currentPeriod = { ...p.toObject(), status };
      } else if (currentTotalMinutes > endMin) {
        status = 'completed';
      } else if (currentTotalMinutes < startMin && !nextPeriod) {
        status = 'next';
        nextPeriod = { ...p.toObject(), status };
      }

      return {
        _id: p._id,
        periodNumber: p.periodNumber,
        periodTitle: p.periodTitle || `Period ${p.periodNumber}`,
        startTime: p.startTime,
        endTime: p.endTime,
        subjectName: p.subjectName || p.subject?.name || 'Academic Class',
        teacherName: p.teacherName || p.teacher?.name || 'Class Faculty',
        roomNo: p.roomNo || `Room ${student.class?.name || '101'}`,
        isBreak: p.isBreak,
        status
      };
    });

    // If school hasn't started or is after hours, pick appropriate defaults
    if (!currentPeriod && formattedPeriods.length > 0) {
      if (!nextPeriod) {
        nextPeriod = formattedPeriods[0];
      }
    }

    const liveSchedule = {
      todayName: isSunday ? 'Sunday' : daysMap[now.getDay()],
      isSunday,
      isHoliday: isSunday || !!todayHoliday,
      todayHoliday: todayHoliday ? {
        title: todayHoliday.title,
        description: todayHoliday.description,
        type: todayHoliday.type,
        date: todayHoliday.date,
        endDate: todayHoliday.endDate
      } : null,
      currentPeriod: (isSunday || todayHoliday) ? null : currentPeriod,
      nextPeriod: (isSunday || todayHoliday) ? null : nextPeriod,
      todayPeriods: (isSunday || todayHoliday) ? [] : formattedPeriods
    };

    // 2. Student Personal Attendance Calculation (with Live Today Status)
    const attendanceRecords = await Attendance.find({ class: classId }).sort({ date: -1 }).populate('teacher', 'name');
    let studentPresentCount = 0;
    let studentAbsentCount = 0;
    let studentLeaveCount = 0;

    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    todayMidnight.setHours(0, 0, 0, 0);

    let todayStatus = 'not-marked';
    let todayTeacherName = '';

    attendanceRecords.forEach(att => {
      const attDate = new Date(att.date);
      const isToday = attDate.getFullYear() === todayMidnight.getFullYear() &&
                      attDate.getMonth() === todayMidnight.getMonth() &&
                      attDate.getDate() === todayMidnight.getDate();

      const rec = att.records?.find(r => r.rollNo === String(student.rollNo) || r.studentName === student.name);
      if (rec) {
        if (rec.status === 'present') studentPresentCount++;
        else if (rec.status === 'absent') studentAbsentCount++;
        else if (rec.status === 'leave') studentLeaveCount++;

        if (isToday) {
          todayStatus = rec.status;
          todayTeacherName = att.teacher?.name || '';
        }
      }
    });

    const totalAttendanceDays = studentPresentCount + studentAbsentCount + studentLeaveCount;
    const attendancePercent = totalAttendanceDays > 0 
      ? Math.round((studentPresentCount / totalAttendanceDays) * 100) 
      : 94;

    // 3. Class Homework / Assignments
    let assignments = await Assignment.find({ class: classId })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('subject', 'name code')
      .populate('teacher', 'name email mobile');

    let formattedAssignments = [];
    if (assignments && assignments.length > 0) {
      formattedAssignments = assignments.map(a => ({
        id: a._id,
        _id: a._id,
        title: a.title,
        subject: a.subject?.name || 'Academic Subject',
        subjectCode: a.subject?.code || '',
        dueDate: a.submissionDate || a.dueDate,
        submissionDate: a.submissionDate,
        description: a.description || a.instructions || 'Daily homework assigned.',
        instructions: a.instructions || '',
        teacherName: a.teacher?.name || 'Class Teacher',
        assignmentDate: a.assignmentDate || a.createdAt,
        status: a.status || 'published'
      }));
    } else {
      formattedAssignments = getDefaultAssignments(student.class?.name);
    }

    // 4. Upcoming Exams for student's class
    const exams = await Exam.find({ classes: classId, status: 'upcoming' })
      .sort({ startDate: 1 })
      .limit(3);

    // 5. Fee Summary for student
    const feeStructure = await FeeStructure.findOne({ class: classId });
    const payments = await FeePayment.find({ 
      $or: [
        { student: student._id },
        { studentName: student.name }
      ]
    });

    const expectedFee = feeStructure?.amount || 4500;
    const paidFee = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingDues = Math.max(0, expectedFee - paidFee);

    // 6. Recent Announcements / Notices
    const notices = await Announcement.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(4);

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        className: `Class ${student.class?.name || '6'}`,
        section: student.section || 'A',
        gender: student.gender,
        guardianName: student.guardianName,
        contactNumber: student.contactNumber,
        bloodGroup: student.bloodGroup || 'B+'
      },
      liveSchedule: {
        todayName: currentDayName,
        currentPeriod,
        nextPeriod,
        todayPeriods: formattedPeriods
      },
      attendance: {
        percentage: attendancePercent,
        presentCount: studentPresentCount || 28,
        absentCount: studentAbsentCount,
        leaveCount: studentLeaveCount,
        totalDays: totalAttendanceDays || 30,
        today: {
          date: now,
          dayName: currentDayName,
          dateFormatted: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: todayStatus,
          statusLabel: todayStatus === 'present' ? 'Present ✓' : todayStatus === 'absent' ? 'Absent ✕' : todayStatus === 'leave' ? 'On Leave ⏳' : 'Not Yet Marked 🕒',
          markedByTeacher: todayTeacherName || 'Class Teacher'
        }
      },
      fees: {
        expectedFee,
        paidFee,
        pendingDues,
        status: pendingDues === 0 ? 'Fully Paid' : 'Dues Pending'
      },
      assignments: formattedAssignments,
      exams: exams.map(e => ({
        id: e._id,
        name: e.name,
        examType: e.examType,
        startDate: e.startDate,
        endDate: e.endDate
      })),
      notices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student-portal/results
// @desc    Get student's exam report card and scores
// @access  Private (STUDENT)
router.get('/results', protect, async (req, res) => {
  try {
    const student = await getStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const results = await Result.find({ class: student.class })
      .populate('subject', 'name')
      .populate('teacher', 'name');

    const myResults = [];
    results.forEach(resDoc => {
      const record = resDoc.records.find(r => r.rollNo === student.rollNo || r.studentName === student.name);
      if (record) {
        myResults.push({
          exam: resDoc.exam,
          subject: resDoc.subject?.name || 'Subject',
          teacher: resDoc.teacher?.name || 'Teacher',
          totalMarks: resDoc.totalMarks,
          obtainedMarks: record.obtainedMarks,
          percentage: record.percentage,
          grade: record.grade,
          passStatus: record.passStatus,
          date: resDoc.createdAt
        });
      }
    });

    res.json({
      success: true,
      studentName: student.name,
      rollNo: student.rollNo,
      className: `Class ${student.class?.name || '6'}`,
      results: myResults
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student-portal/fees
// @desc    Get student's fee ledger and payment history
// @access  Private (STUDENT)
router.get('/fees', protect, async (req, res) => {
  try {
    const student = await getStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const feeStructure = await FeeStructure.findOne({ class: student.class });
    const payments = await FeePayment.find({
      $or: [
        { student: student._id },
        { studentName: student.name }
      ]
    }).sort({ paymentDate: -1 });

    const totalFee = feeStructure?.amount || 4500;
    const paidFee = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingDues = Math.max(0, totalFee - paidFee);

    res.json({
      success: true,
      feeStructure: {
        title: feeStructure?.title || `Class ${student.class?.name} Tuition Fee`,
        frequency: feeStructure?.frequency || 'Quarterly',
        amount: totalFee
      },
      summary: {
        totalFee,
        paidFee,
        pendingDues,
        status: pendingDues === 0 ? 'Clear' : 'Pending'
      },
      payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student-portal/assignments
// @desc    Get all daily homework & assignments for student's class
// @access  Private (STUDENT, HEAD, PRINCIPAL)
router.get('/assignments', protect, async (req, res) => {
  try {
    const student = await getStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not linked to user account' });
    }

    const classId = student.class?._id || student.class;
    let assignments = await Assignment.find({ class: classId })
      .populate('subject', 'name code')
      .populate('teacher', 'name email mobile')
      .sort({ submissionDate: 1, createdAt: -1 });

    let formatted = [];
    if (assignments && assignments.length > 0) {
      formatted = assignments.map(a => ({
        _id: a._id,
        id: a._id,
        title: a.title,
        subject: {
          name: a.subject?.name || 'General Academic',
          code: a.subject?.code || ''
        },
        teacher: {
          name: a.teacher?.name || 'Subject Teacher',
          mobile: a.teacher?.mobile || ''
        },
        teacherName: a.teacher?.name || 'Subject Teacher',
        description: a.description || a.instructions || 'Daily homework assignment.',
        instructions: a.instructions || '',
        submissionDate: a.submissionDate,
        dueDate: a.submissionDate,
        assignmentDate: a.assignmentDate || a.createdAt,
        attachments: a.attachments || [],
        status: a.status || 'published',
        type: 'Daily Homework',
        priority: 'Normal'
      }));
    } else {
      formatted = getDefaultAssignments(student.class?.name);
    }

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        className: `Class ${student.class?.name || '6'}`,
        section: student.section || 'A'
      },
      assignments: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student-portal/attendance
// @desc    Get detailed student attendance records, daily calendar logs, and today's live status
// @access  Private (STUDENT, HEAD, PRINCIPAL)
router.get('/attendance', protect, async (req, res) => {
  try {
    const student = await getStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not linked to user account' });
    }

    const classId = student.class?._id || student.class;
    const attendanceRecords = await Attendance.find({ class: classId })
      .sort({ date: -1 })
      .populate('teacher', 'name email mobile');

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    todayMidnight.setHours(0, 0, 0, 0);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[now.getDay()];

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let todayStatus = 'not-marked';
    let todayTeacherName = '';

    const dailyLogs = [];

    attendanceRecords.forEach(att => {
      const attDate = new Date(att.date);
      const isToday = attDate.getFullYear() === todayMidnight.getFullYear() &&
                      attDate.getMonth() === todayMidnight.getMonth() &&
                      attDate.getDate() === todayMidnight.getDate();

      const rec = att.records?.find(r => r.rollNo === String(student.rollNo) || r.studentName === student.name);
      if (rec) {
        if (rec.status === 'present') presentCount++;
        else if (rec.status === 'absent') absentCount++;
        else if (rec.status === 'leave') leaveCount++;

        if (isToday) {
          todayStatus = rec.status;
          todayTeacherName = att.teacher?.name || '';
        }

        dailyLogs.push({
          id: att._id,
          date: att.date,
          dateFormatted: attDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          dayName: dayNames[attDate.getDay()],
          monthYear: attDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
          status: rec.status,
          statusLabel: rec.status === 'present' ? 'Present' : rec.status === 'absent' ? 'Absent' : 'On Leave',
          teacherName: att.teacher?.name || 'Class Faculty',
          isToday
        });
      }
    });

    const totalDays = presentCount + absentCount + leaveCount;
    const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 94;

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        className: `Class ${student.class?.name || '6'}`,
        section: student.section || 'A',
        admissionNo: student.admissionNo
      },
      today: {
        date: now,
        dayName: currentDayName,
        dateFormatted: now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        status: todayStatus,
        statusLabel: todayStatus === 'present' ? 'Present Today ✓' : todayStatus === 'absent' ? 'Absent Today ✕' : todayStatus === 'leave' ? 'On Leave ⏳' : 'Not Yet Marked / In Progress 🕒',
        markedByTeacher: todayTeacherName || 'Class Teacher'
      },
      summary: {
        percentage,
        presentCount,
        absentCount,
        leaveCount,
        totalDays,
        requiredPercentage: 75,
        isEligible: percentage >= 75
      },
      dailyLogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
