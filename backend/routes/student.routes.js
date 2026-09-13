const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Parent = require('../models/Parent');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { generateAutoPassword } = require('../utils/passwordGenerator');

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
        { guardianName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
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

// Get single student by ID with complete profile & portal credentials (HEAD / PRINCIPAL)
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'name section')
      .populate('parent');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Lookup user portal account
    let portalAccount = null;
    if (['HEAD', 'PRINCIPAL'].includes(req.user.role)) {
      portalAccount = await User.findOne({
        $or: [
          { studentRef: student._id },
          { admissionNo: student.admissionNo }
        ]
      }).select('email role status lastLogin generatedPassword mustChangePassword createdAt');
    }

    res.json({ success: true, student, portalAccount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new student (Complete Admission)
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
      academicYear,
      admissionDate,
      previousSchool,
      tcNumber,
      bloodGroup,
      category,
      religion,
      nationality,
      aadhaarNumber,
      profilePhoto,
      fatherName,
      fatherPhone,
      fatherOccupation,
      motherName,
      motherPhone,
      motherOccupation,
      guardianName,
      parent: parentId,
      contactNumber,
      alternateNumber,
      email,
      address,
      city,
      state,
      pincode,
      transportOpted,
      busRoute,
      medicalNotes,
      status
    } = req.body;

    if (!name || !classId) {
      return res.status(400).json({ success: false, message: 'Student Name and Class are required.' });
    }

    // Auto-generate admissionNo if missing
    let finalAdmNo = admissionNo ? admissionNo.trim() : '';
    if (!finalAdmNo) {
      const count = await Student.countDocuments();
      finalAdmNo = `NVP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    // Auto-assign roll number in class if missing
    let finalRollNo = rollNo ? String(rollNo).trim() : '';
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
      name: name.trim(),
      gender: gender || 'Male',
      dob: dob ? new Date(dob) : undefined,
      class: classId,
      section: section || 'A',
      academicYear: academicYear || '2026-2027',
      admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
      previousSchool: previousSchool || '',
      tcNumber: tcNumber || '',
      bloodGroup: bloodGroup || 'O+',
      category: category || 'General',
      religion: religion || 'Hindu',
      nationality: nationality || 'Indian',
      aadhaarNumber: aadhaarNumber || '',
      profilePhoto: profilePhoto || '',
      fatherName: fatherName || '',
      fatherPhone: fatherPhone || '',
      fatherOccupation: fatherOccupation || '',
      motherName: motherName || '',
      motherPhone: motherPhone || '',
      motherOccupation: motherOccupation || '',
      guardianName: guardianName || fatherName || '',
      parent: parentId || undefined,
      contactNumber: contactNumber || fatherPhone || '',
      alternateNumber: alternateNumber || motherPhone || '',
      email: email || '',
      address: address || '',
      city: city || 'Nimbi Jodhan',
      state: state || 'Rajasthan',
      pincode: pincode || '341316',
      transportOpted: Boolean(transportOpted),
      busRoute: busRoute || '',
      medicalNotes: medicalNotes || 'Normal Health',
      status: status || 'active'
    });

    // Auto-provision Student Portal Login Account
    const studentLoginEmail = (email && email.includes('@'))
      ? email.toLowerCase().trim()
      : `${finalAdmNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.school.local`;

    const plainPassword = generateAutoPassword({ name, admissionNo: finalAdmNo, role: 'STUDENT' });
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const userAccount = await User.findOneAndUpdate(
      { admissionNo: finalAdmNo },
      {
        name: student.name,
        email: studentLoginEmail,
        passwordHash,
        generatedPassword: plainPassword,
        role: 'STUDENT',
        admissionNo: finalAdmNo,
        studentClass: classId,
        studentRef: student._id,
        mobile: student.contactNumber,
        status: 'active',
        mustChangePassword: true
      },
      { upsert: true, new: true }
    );

    // If parent selected, link student to parent
    if (parentId) {
      await Parent.findByIdAndUpdate(parentId, { $addToSet: { students: student._id } });
    }

    // Update studentCount in Class
    const totalInClass = await Student.countDocuments({ class: classId, status: 'active' });
    await Class.findByIdAndUpdate(classId, { studentCount: totalInClass });

    const populatedStudent = await Student.findById(student._id).populate('class', 'name section').populate('parent');

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully and portal account created.',
      student: populatedStudent,
      generatedPassword: plainPassword,
      loginId: finalAdmNo
    });
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

    // Sync student portal account if exists
    await User.findOneAndUpdate(
      { $or: [{ studentRef: student._id }, { admissionNo: student.admissionNo }] },
      {
        name: student.name,
        studentClass: student.class?._id || student.class,
        mobile: student.contactNumber,
        status: student.status === 'active' ? 'active' : 'inactive'
      }
    );

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

    // Remove portal user account
    await User.findOneAndDelete({
      $or: [{ studentRef: student._id }, { admissionNo: student.admissionNo }]
    });

    // Update class student count
    const totalInClass = await Student.countDocuments({ class: student.class, status: 'active' });
    await Class.findByIdAndUpdate(student.class, { studentCount: totalInClass });

    res.json({ success: true, message: 'Student and portal account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
