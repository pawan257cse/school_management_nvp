const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Class = require('../models/Class');
const { protect } = require('../middleware/auth');
const { logActivity } = require('../middleware/auditLogger');

// Helper function to compute grade & status
const calculateGradeAndStatus = (obtained, total) => {
  const percentage = Math.round((obtained / total) * 100 * 10) / 10;
  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 33) grade = 'D';
  else grade = 'F';

  const passStatus = percentage >= 33 ? 'pass' : 'fail';
  return { percentage, grade, passStatus };
};

// @route   GET /api/results
// @desc    Get results for class, subject, exam
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { classId, subjectId, exam } = req.query;
    let query = {};

    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;
    if (exam) query.exam = exam;

    if (req.user.role === 'TEACHER') {
      const assignedClassIds = (req.user.assignedClasses || []).map(c => (c._id || c).toString());
      query.class = { $in: assignedClassIds };
    }

    const results = await Result.find(query)
      .populate('teacher', 'name email')
      .populate('class', 'name section studentCount')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/results
// @desc    Save/Update student exam marks
// @access  Private (TEACHER, PRINCIPAL, HEAD)
router.post('/', protect, async (req, res) => {
  try {
    const { classId, subjectId, exam, totalMarks, records } = req.body;

    if (!classId || !subjectId || !exam || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Class, Subject, Exam Name, and Student Marks are required.' });
    }

    if (req.user.role === 'TEACHER') {
      const assignedClassIds = (req.user.assignedClasses || []).map(c => (c._id || c).toString());
      if (!assignedClassIds.includes(classId.toString())) {
        return res.status(403).json({ success: false, message: 'Class not assigned to you.' });
      }
    }

    const maxMarks = totalMarks || 100;
    const computedRecords = records.map(r => {
      const obtained = Number(r.obtainedMarks) || 0;
      const { percentage, grade, passStatus } = calculateGradeAndStatus(obtained, maxMarks);
      return {
        studentName: r.studentName,
        rollNo: r.rollNo,
        obtainedMarks: obtained,
        percentage,
        grade,
        passStatus
      };
    });

    const resultDoc = await Result.findOneAndUpdate(
      { class: classId, subject: subjectId, exam },
      {
        teacher: req.user._id,
        totalMarks: maxMarks,
        records: computedRecords
      },
      { new: true, upsert: true, runValidators: true }
    );

    await logActivity(req, 'UPDATE_RESULT', 'Result', resultDoc._id, {
      exam,
      studentCount: computedRecords.length
    });

    res.json({ success: true, message: 'Exam results saved and graded successfully.', result: resultDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
