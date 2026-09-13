const express = require('express');
const router = express.Router();
const { FeeStructure, FeePayment } = require('../models/Fee');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get Fee Structures
router.get('/structures', protect, async (req, res) => {
  try {
    const structures = await FeeStructure.find()
      .populate('class', 'name section')
      .sort({ class: 1 });
    res.json({ success: true, count: structures.length, structures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Fee Structure
router.post('/structures', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { title, class: classId, amount, feeType, frequency, academicYear } = req.body;
    if (!title || !classId || !amount) {
      return res.status(400).json({ success: false, message: 'Title, Class and Amount are required.' });
    }

    const structure = await FeeStructure.create({
      title,
      class: classId,
      amount: Number(amount),
      feeType: feeType || 'Tuition',
      frequency: frequency || 'Quarterly',
      academicYear: academicYear || '2026-2027'
    });

    const populated = await FeeStructure.findById(structure._id).populate('class', 'name section');
    res.status(201).json({ success: true, message: 'Fee structure configured.', structure: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Fee Structure
router.delete('/structures/:id', protect, checkRole('HEAD'), async (req, res) => {
  try {
    await FeeStructure.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Fee structure deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Fee Payments with filter
router.get('/payments', protect, async (req, res) => {
  try {
    const { search, status, limit } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { receiptNo: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { className: { $regex: search, $options: 'i' } }
      ];
    }

    const maxResults = limit ? parseInt(limit) : 100;
    const payments = await FeePayment.find(query)
      .populate('student', 'admissionNo rollNo contactNumber')
      .sort({ paymentDate: -1 })
      .limit(maxResults);

    // Compute 30-day collection
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const thirtyDayAgg = await FeePayment.aggregate([
      { $match: { status: 'Completed', paymentDate: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const payments30d = thirtyDayAgg.length > 0 ? thirtyDayAgg[0].total : 0;

    res.json({ success: true, count: payments.length, payments, payments30d });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Record Fee Payment
router.post('/payments', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { studentId, amount, feeType, paymentMethod, remarks } = req.body;

    if (!studentId || !amount) {
      return res.status(400).json({ success: false, message: 'Student and Amount are required.' });
    }

    const student = await Student.findById(studentId).populate('class', 'name section');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const receiptCount = await FeePayment.countDocuments();
    const receiptNo = `REC-${new Date().getFullYear()}-${String(receiptCount + 1001).padStart(5, '0')}`;

    const payment = await FeePayment.create({
      receiptNo,
      student: student._id,
      studentName: student.name,
      className: `${student.class?.name || ''} - ${student.section || ''}`,
      amount: Number(amount),
      feeType: feeType || 'Tuition Fee',
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'Cash',
      status: 'Completed',
      remarks: remarks || ''
    });

    res.status(201).json({ success: true, message: 'Fee payment recorded successfully.', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
