const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Class = require('../models/Class');
const Parent = require('../models/Parent');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get all students with filter & search
router.get('/', protect, async (req, res) => {
  try {
    const { classId, search, status } = req.query;
    const query = {};

    if (classId) {
      query.class = classId;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { guardianName: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .populate('class', 'name section')
      .populate('parent', 'name phone email relation')
      .sort({ rollNo: 1, name: 1 });

    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single student by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'name section')
      .populate('parent');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new student
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const {
      admissionNo,
      rollNo,
      name,
      gender,
      dob,
      class: classId,
      section,
      parent: parentId,
      guardianName,
      contactNumber,
      address,
      bloodGroup,
      status
    } = req.body;

    if (!name || !classId) {
      return res.status(400).json({ success: false, message: 'Student Name and Class are required.' });
    }

    // Auto-generate admissionNo if missing
    let finalAdmNo = admissionNo;
    if (!finalAdmNo) {
      const count = await Student.countDocuments();
      finalAdmNo = `NVP-ADM-${String(count + 1).padStart(4, '0')}`;
    }

    // Auto-assign roll number in class if missing
    let finalRollNo = rollNo;
    if (!finalRollNo) {
      const classStudentCount = await Student.countDocuments({ class: classId });
      finalRollNo = String(classStudentCount + 1);
    }

    // Check admissionNo uniqueness
    const existing = await Student.findOne({ admissionNo: finalAdmNo });
    if (existing) {
      return res.status(400).json({ success: false, message: `Admission Number ${finalAdmNo} is already registered.` });
    }

    const student = await Student.create({
      admissionNo: finalAdmNo,
      rollNo: finalRollNo,
      name,
      gender: gender || 'Male',
      dob: dob ? new Date(dob) : undefined,
      class: classId,
      section: section || 'A',
      parent: parentId || undefined,
      guardianName: guardianName || '',
      contactNumber: contactNumber || '',
      address: address || '',
      bloodGroup: bloodGroup || '',
      status: status || 'active'
    });

    // If parent selected, link student to parent
    if (parentId) {
      await Parent.findByIdAndUpdate(parentId, { $addToSet: { students: student._id } });
    }

    // Update studentCount in Class
    const totalInClass = await Student.countDocuments({ class: classId, status: 'active' });
    await Class.findByIdAndUpdate(classId, { studentCount: totalInClass });

    const populatedStudent = await Student.findById(student._id).populate('class', 'name section').populate('parent');

    res.status(201).json({ success: true, message: 'Student enrolled successfully.', student: populatedStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update student
router.put('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('class', 'name section')
      .populate('parent');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.json({ success: true, message: 'Student record updated successfully.', student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete student
router.delete('/:id', protect, checkRole('HEAD'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Update class student count
    const totalInClass = await Student.countDocuments({ class: student.class, status: 'active' });
    await Class.findByIdAndUpdate(student.class, { studentCount: totalInClass });

    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
