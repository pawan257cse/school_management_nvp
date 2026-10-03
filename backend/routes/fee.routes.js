const express = require('express');
const router = express.Router();
const { FeeStructure, FeeDiscount, FeePayment } = require('../models/Fee');
const Student = require('../models/Student');
const Class = require('../models/Class');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Helper to compute a student's live fee ledger
const calculateStudentFeeLedger = async (studentId, academicYear = '2026-2027') => {
  const student = await Student.findById(studentId).populate('class', 'name section');
  if (!student) return null;

  // Find fee structure for student's class
  let feeStructure = null;
  if (student.class) {
    feeStructure = await FeeStructure.findOne({ class: student.class._id, academicYear });
  }

  // Base Fee calculation
  let totalBaseFee = feeStructure ? feeStructure.totalBaseFee : 30000;
  let feeHeads = feeStructure && feeStructure.feeHeads && feeStructure.feeHeads.length > 0 
    ? feeStructure.feeHeads 
    : [
        { headName: 'Tuition Fee', amount: Math.round(totalBaseFee * 0.6), frequency: 'Annual' },
        { headName: 'Exam Fee', amount: Math.round(totalBaseFee * 0.1), frequency: 'Annual' },
        { headName: 'Computer & Lab Fee', amount: Math.round(totalBaseFee * 0.15), frequency: 'Annual' },
        { headName: 'Development & Activity Fee', amount: Math.round(totalBaseFee * 0.15), frequency: 'Annual' }
      ];

  // Check discount
  const discountDoc = await FeeDiscount.findOne({ student: student._id, academicYear });
  const discountAmount = discountDoc ? discountDoc.discountAmount : 0;
  const discountReason = discountDoc ? discountDoc.reason : '';
  const discountAuthorizedBy = discountDoc ? discountDoc.authorizedBy : '';

  const netPayableFee = Math.max(0, totalBaseFee - discountAmount);

  // Get all completed payments for this student
  const payments = await FeePayment.find({ student: student._id, status: 'Completed' }).sort({ paymentDate: 1 });
  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingAmount = Math.max(0, netPayableFee - totalPaid);

  let status = 'Pending';
  if (pendingAmount === 0 && netPayableFee > 0) {
    status = 'Paid';
  } else if (totalPaid > 0 && pendingAmount > 0) {
    status = 'Partial';
  }

  // Generate Installment Schedule
  let installments = [];
  if (feeStructure && feeStructure.installments && feeStructure.installments.length > 0) {
    installments = feeStructure.installments;
  } else {
    // Default 4 Installments
    const instAmt = Math.round(netPayableFee / 4);
    installments = [
      { installmentNo: 1, title: 'Installment 1 (Q1)', dueDate: new Date('2026-04-10'), amount: instAmt },
      { installmentNo: 2, title: 'Installment 2 (Q2)', dueDate: new Date('2026-07-10'), amount: instAmt },
      { installmentNo: 3, title: 'Installment 3 (Q3)', dueDate: new Date('2026-10-10'), amount: instAmt },
      { installmentNo: 4, title: 'Installment 4 (Q4)', dueDate: new Date('2026-01-10'), amount: netPayableFee - (instAmt * 3) }
    ];
  }

  // Calculate Status per installment
  let runningPaid = totalPaid;
  const processedInstallments = installments.map(inst => {
    let instStatus = 'Pending';
    let paidForInst = 0;
    if (runningPaid >= inst.amount) {
      paidForInst = inst.amount;
      instStatus = 'Paid';
      runningPaid -= inst.amount;
    } else if (runningPaid > 0) {
      paidForInst = runningPaid;
      instStatus = 'Partial';
      runningPaid = 0;
    } else {
      const now = new Date();
      if (inst.dueDate && new Date(inst.dueDate) < now) {
        instStatus = 'Overdue';
      }
    }
    return {
      ...inst,
      paidAmount: paidForInst,
      status: instStatus
    };
  });

  return {
    studentId: student._id,
    studentName: student.name,
    admissionNo: student.admissionNo || student.srnNo || 'NVP-STD',
    rollNo: student.rollNo || '-',
    classId: student.class?._id,
    className: student.class ? `Class ${student.class.name}` : 'N/A',
    section: student.section || 'A',
    fatherName: student.fatherName || '',
    contactNumber: student.contactNumber || student.fatherPhone || '',
    academicYear,
    totalBaseFee,
    feeHeads,
    discountAmount,
    discountReason,
    discountAuthorizedBy,
    netPayableFee,
    totalPaid,
    pendingAmount,
    status,
    installments: processedInstallments,
    paymentHistory: payments
  };
};

// 1. GET Fee Structures
router.get('/structures', protect, async (req, res) => {
  try {
    const { academicYear = '2026-2027' } = req.query;
    const structures = await FeeStructure.find({ academicYear })
      .populate('class', 'name section')
      .sort({ className: 1 });
    res.json({ success: true, count: structures.length, structures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. CREATE or UPDATE Fee Structure
router.post('/structures', protect, checkRole('HEAD', 'PRINCIPAL', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { classId, feeHeads, installments, academicYear = '2026-2027' } = req.body;
    if (!classId) {
      return res.status(400).json({ success: false, message: 'Class selection is required.' });
    }

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found.' });
    }

    const formattedHeads = Array.isArray(feeHeads) && feeHeads.length > 0 
      ? feeHeads.map(h => ({
          headName: h.headName || 'Fee Head',
          amount: Number(h.amount) || 0,
          frequency: h.frequency || 'Annual'
        }))
      : [
          { headName: 'Tuition Fee', amount: 18000, frequency: 'Annual' },
          { headName: 'Exam Fee', amount: 3000, frequency: 'Annual' },
          { headName: 'Computer Fee', amount: 4500, frequency: 'Annual' },
          { headName: 'Development Fee', amount: 4500, frequency: 'Annual' }
        ];

    const totalBaseFee = formattedHeads.reduce((acc, h) => acc + h.amount, 0);

    const formattedInstallments = Array.isArray(installments) && installments.length > 0
      ? installments.map((inst, idx) => ({
          installmentNo: idx + 1,
          title: inst.title || `Installment ${idx + 1}`,
          dueDate: inst.dueDate ? new Date(inst.dueDate) : new Date(),
          amount: Number(inst.amount) || Math.round(totalBaseFee / installments.length)
        }))
      : [
          { installmentNo: 1, title: 'Installment 1 (Apr)', dueDate: new Date('2026-04-10'), amount: Math.round(totalBaseFee / 4) },
          { installmentNo: 2, title: 'Installment 2 (Jul)', dueDate: new Date('2026-07-10'), amount: Math.round(totalBaseFee / 4) },
          { installmentNo: 3, title: 'Installment 3 (Oct)', dueDate: new Date('2026-10-10'), amount: Math.round(totalBaseFee / 4) },
          { installmentNo: 4, title: 'Installment 4 (Jan)', dueDate: new Date('2026-01-10'), amount: totalBaseFee - (Math.round(totalBaseFee / 4) * 3) }
        ];

    const structure = await FeeStructure.findOneAndUpdate(
      { class: cls._id, academicYear },
      {
        class: cls._id,
        className: `Class ${cls.name}`,
        section: cls.section || 'A',
        academicYear,
        feeHeads: formattedHeads,
        totalBaseFee,
        installments: formattedInstallments,
        status: 'active'
      },
      { upsert: true, new: true }
    ).populate('class', 'name section');

    res.status(201).json({ success: true, message: 'Class Fee Structure configured successfully.', structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. DELETE Fee Structure
router.delete('/structures/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    await FeeStructure.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Fee structure removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. GET Class-Wise Fee Overview Dashboard
router.get('/class-overview', protect, async (req, res) => {
  try {
    const { classId, section = 'A', academicYear = '2026-2027' } = req.query;

    let query = { status: 'active' };
    if (classId) {
      query.class = classId;
    }
    if (section) {
      query.section = section;
    }

    const students = await Student.find(query)
      .populate('class', 'name section')
      .sort({ name: 1 });

    const studentLedgers = [];
    let totalDemandedFee = 0;
    let totalCollectedFee = 0;
    let totalPendingFee = 0;

    for (const st of students) {
      const ledger = await calculateStudentFeeLedger(st._id, academicYear);
      if (ledger) {
        studentLedgers.push(ledger);
        totalDemandedFee += ledger.netPayableFee;
        totalCollectedFee += ledger.totalPaid;
        totalPendingFee += ledger.pendingAmount;
      }
    }

    res.json({
      success: true,
      count: studentLedgers.length,
      metrics: {
        totalStudents: studentLedgers.length,
        totalDemandedFee,
        totalCollectedFee,
        totalPendingFee
      },
      students: studentLedgers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. GET Student-Wise Fee Ledger
router.get('/student-ledger/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear = '2026-2027' } = req.query;

    const ledger = await calculateStudentFeeLedger(studentId, academicYear);
    if (!ledger) {
      return res.status(404).json({ success: false, message: 'Student fee ledger not found.' });
    }

    res.json({ success: true, ledger });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. APPLY Student Fee Discount / Scholarship
router.post('/discount', protect, checkRole('HEAD', 'PRINCIPAL', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { studentId, discountAmount, reason, authorizedBy, academicYear = '2026-2027' } = req.body;
    if (!studentId || discountAmount === undefined) {
      return res.status(400).json({ success: false, message: 'Student ID and Discount Amount are required.' });
    }

    const discountDoc = await FeeDiscount.findOneAndUpdate(
      { student: studentId, academicYear },
      {
        student: studentId,
        academicYear,
        discountAmount: Number(discountAmount) || 0,
        reason: reason || 'Merit / Scholarship Discount',
        authorizedBy: authorizedBy || req.user.name || 'Head Administrator'
      },
      { upsert: true, new: true }
    );

    const updatedLedger = await calculateStudentFeeLedger(studentId, academicYear);
    res.json({ success: true, message: 'Student discount updated successfully.', discount: discountDoc, ledger: updatedLedger });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. RECORD Fee Payment & Generate Receipt
router.post('/payments', protect, checkRole('HEAD', 'PRINCIPAL', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { studentId, amount, feeType, paymentMethod, transactionRefNo, remarks, academicYear = '2026-2027' } = req.body;

    if (!studentId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid Student and Amount are required.' });
    }

    const student = await Student.findById(studentId).populate('class', 'name section');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Get current ledger prior to payment
    const currentLedger = await calculateStudentFeeLedger(studentId, academicYear);
    const previousBalance = currentLedger ? currentLedger.pendingAmount : 0;
    const paidAmt = Number(amount);
    const remainingBalance = Math.max(0, previousBalance - paidAmt);

    const count = await FeePayment.countDocuments();
    const receiptNo = `REC-${new Date().getFullYear()}-${String(count + 1001).padStart(5, '0')}`;

    const payment = await FeePayment.create({
      receiptNo,
      student: student._id,
      studentName: student.name,
      admissionNo: student.admissionNo || student.srnNo || '',
      className: student.class ? `Class ${student.class.name}` : 'N/A',
      section: student.section || 'A',
      academicYear,
      amount: paidAmt,
      feeType: feeType || 'Tuition Fee',
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'Cash',
      transactionRefNo: transactionRefNo || '',
      previousBalance,
      remainingBalance,
      status: 'Completed',
      remarks: remarks || '',
      receivedBy: req.user.name || 'Accounts Office'
    });

    const updatedLedger = await calculateStudentFeeLedger(studentId, academicYear);

    res.status(201).json({
      success: true,
      message: 'Fee payment collected successfully. Official receipt generated.',
      receipt: payment,
      ledger: updatedLedger
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8. GET Fee Payment Receipts History
router.get('/receipts', protect, async (req, res) => {
  try {
    const { search, paymentMethod, startDate, endDate, classId, limit } = req.query;
    const query = { status: { $ne: 'Cancelled' } };

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate && endDate) {
      query.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (search) {
      query.$or = [
        { receiptNo: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { className: { $regex: search, $options: 'i' } }
      ];
    }

    const maxResults = limit ? parseInt(limit) : 200;
    const receipts = await FeePayment.find(query)
      .populate('student', 'name admissionNo rollNo fatherName contactNumber')
      .sort({ paymentDate: -1 })
      .limit(maxResults);

    res.json({ success: true, count: receipts.length, receipts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8b. DELETE Fee Receipt (Cancel or Remove Erroneous Receipt)
router.delete('/receipt/:id', protect, checkRole('HEAD', 'PRINCIPAL', 'ACCOUNTANT'), async (req, res) => {
  try {
    const receipt = await FeePayment.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Fee receipt not found' });
    }

    await FeePayment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `Receipt ${receipt.receiptNo} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8c. PUT Update Fee Receipt Details
router.put('/receipt/:id', protect, checkRole('HEAD', 'PRINCIPAL', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { amount, paymentMethod, transactionRefNo, remarks, feeType, paymentDate } = req.body;
    const receipt = await FeePayment.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Fee receipt not found' });
    }

    if (amount !== undefined) receipt.amount = amount;
    if (paymentMethod !== undefined) receipt.paymentMethod = paymentMethod;
    if (transactionRefNo !== undefined) receipt.transactionRefNo = transactionRefNo;
    if (remarks !== undefined) receipt.remarks = remarks;
    if (feeType !== undefined) receipt.feeType = feeType;
    if (paymentDate !== undefined) receipt.paymentDate = paymentDate;

    await receipt.save();
    res.json({ success: true, message: `Receipt ${receipt.receiptNo} updated successfully`, receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 9. GET Comprehensive Fee Reports
router.get('/reports', protect, checkRole('HEAD', 'PRINCIPAL', 'ACCOUNTANT'), async (req, res) => {
  try {
    const { academicYear = '2026-2027', startDate, endDate } = req.query;

    const dateFilter = { status: 'Completed' };
    if (startDate && endDate) {
      dateFilter.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const allPayments = await FeePayment.find(dateFilter);

    // Total Collection
    const totalCollection = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Mode-wise aggregation
    const modeAggregation = {};
    allPayments.forEach(p => {
      const mode = p.paymentMethod || 'Cash';
      modeAggregation[mode] = (modeAggregation[mode] || 0) + p.amount;
    });

    // Class-wise collection
    const classAggregation = {};
    allPayments.forEach(p => {
      const cName = p.className || 'Other';
      classAggregation[cName] = (classAggregation[cName] || 0) + p.amount;
    });

    // Total Discounts Given
    const discounts = await FeeDiscount.find({ academicYear });
    const totalDiscountsGiven = discounts.reduce((sum, d) => sum + (d.discountAmount || 0), 0);

    // Get total pending from all active students
    const students = await Student.find({ status: 'active' });
    let totalPendingAcrossSchool = 0;
    for (const st of students) {
      const ledger = await calculateStudentFeeLedger(st._id, academicYear);
      if (ledger) {
        totalPendingAcrossSchool += ledger.pendingAmount;
      }
    }

    res.json({
      success: true,
      reports: {
        totalCollection,
        totalDiscountsGiven,
        totalPendingAcrossSchool,
        modeAggregation,
        classAggregation,
        totalReceiptsCount: allPayments.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. GET Student Personal Fee Ledger (Student Portal)
router.get('/my-fees', protect, async (req, res) => {
  try {
    let studentId = req.user.studentRef;

    // Fallback if studentRef is missing on User model
    if (!studentId && req.user.role === 'STUDENT') {
      const st = await Student.findOne({
        $or: [
          { admissionNo: req.user.admissionNo },
          { name: req.user.name }
        ]
      });
      if (st) studentId = st._id;
    }

    if (!studentId) {
      return res.status(404).json({ success: false, message: 'Student account record not found.' });
    }

    const ledger = await calculateStudentFeeLedger(studentId);
    res.json({ success: true, ledger });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
