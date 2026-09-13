const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get Promotion History
router.get('/', protect, async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate('fromClass', 'name section')
      .populate('toClass', 'name section')
      .sort({ promotionDate: -1 });

    res.json({ success: true, count: promotions.length, promotions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Execute Batch Promotion
router.post('/execute', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { fromClassId, toClassId, academicYearFrom, academicYearTo, studentIds, remarks } = req.body;

    if (!fromClassId || !toClassId) {
      return res.status(400).json({ success: false, message: 'Source class and Destination class are required.' });
    }

    const fromClass = await Class.findById(fromClassId);
    const toClass = await Class.findById(toClassId);

    if (!fromClass || !toClass) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    // Determine target students
    const query = { class: fromClassId, status: 'active' };
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      query._id = { $in: studentIds };
    }

    const eligibleStudents = await Student.find(query);
    if (eligibleStudents.length === 0) {
      return res.status(400).json({ success: false, message: 'No eligible active students found in this class.' });
    }

    // Update students to new class
    const studentSummary = [];
    for (const st of eligibleStudents) {
      st.class = toClassId;
      await st.save();
      studentSummary.push({
        studentId: st._id,
        studentName: st.name,
        rollNo: st.rollNo,
        status: 'Promoted'
      });
    }

    // Update class counts
    const fromCount = await Student.countDocuments({ class: fromClassId, status: 'active' });
    const toCount = await Student.countDocuments({ class: toClassId, status: 'active' });
    await Class.findByIdAndUpdate(fromClassId, { studentCount: fromCount });
    await Class.findByIdAndUpdate(toClassId, { studentCount: toCount });

    // Record promotion log
    const promotionLog = await Promotion.create({
      fromClass: fromClassId,
      fromClassName: `${fromClass.name} - ${fromClass.section}`,
      toClass: toClassId,
      toClassName: `${toClass.name} - ${toClass.section}`,
      academicYearFrom: academicYearFrom || '2025-2026',
      academicYearTo: academicYearTo || '2026-2027',
      promotedCount: eligibleStudents.length,
      students: studentSummary,
      remarks: remarks || `Promoted ${eligibleStudents.length} students from ${fromClass.name} to ${toClass.name}.`
    });

    res.status(201).json({
      success: true,
      message: `Successfully promoted ${eligibleStudents.length} students from ${fromClass.name} to ${toClass.name}.`,
      promotion: promotionLog
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
