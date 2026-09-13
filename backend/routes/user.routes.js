const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { logActivity } = require('../middleware/auditLogger');
const { generatePassword } = require('../utils/passwordGenerator');

// ─── GET /api/users ────────────────────────────────────────────────────────────
// Get all users with optional filtering (role, status, search)
// Access: HEAD, PRINCIPAL
router.get('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } }
      ];
    }

    // PRINCIPAL cannot view HEAD accounts
    if (req.user.role === 'PRINCIPAL') {
      query.role = { $ne: 'HEAD' };
    }

    const users = await User.find(query)
      .populate('assignedClasses', 'name section')
      .populate('assignedSubjects', 'name code')
      .populate('studentClass', 'name section')
      .sort({ role: 1, createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/users/credentials ───────────────────────────────────────────────
// Get all user credentials (email + generated password) for admin view
// Access: HEAD, PRINCIPAL ONLY — never exposed to teachers/students
router.get('/credentials', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) query.role = role;

    // PRINCIPAL cannot see HEAD credentials
    if (req.user.role === 'PRINCIPAL') {
      query.role = { $ne: 'HEAD' };
    }

    const users = await User.find(query)
      .select('name email role admissionNo employeeId generatedPassword status mustChangePassword studentClass createdAt')
      .populate('studentClass', 'name section')
      .sort({ role: 1, name: 1 });

    res.json({
      success: true,
      count: users.length,
      credentials: users.map(u => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        admissionNo: u.admissionNo || '',
        employeeId: u.employeeId || '',
        className: u.studentClass ? `Class ${u.studentClass.name}${u.studentClass.section ? ' ' + u.studentClass.section : ''}` : '',
        password: u.generatedPassword || '(user set own password)',
        status: u.status,
        mustChangePassword: u.mustChangePassword,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/users ───────────────────────────────────────────────────────────
// Create a new Teacher, Principal, or Student account
// Auto-generates password if none provided
// Access: HEAD, PRINCIPAL
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const {
      name, email, temporaryPassword, role, mobile, employeeId,
      gender, qualification, joiningDate, assignedClasses, assignedSubjects,
      admissionNo
    } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'Name, Email, and Role are required.' });
    }

    // Security Check: PRINCIPAL cannot create HEAD account
    if (req.user.role === 'PRINCIPAL' && role === 'HEAD') {
      return res.status(403).json({ success: false, message: 'Principals cannot create Head Administrator accounts.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Generate a unique employee ID for teachers/principals
    const newEmployeeId = employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    // AUTO-GENERATE password if not provided
    const autoPassword = temporaryPassword || generatePassword(name, role, role === 'STUDENT' ? admissionNo : newEmployeeId);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(autoPassword, salt);

    // For STUDENT accounts: auto-link to Student record by admissionNo
    let studentRef = null;
    let studentClass = null;
    let resolvedAdmissionNo = admissionNo || '';

    if (role === 'STUDENT' && admissionNo) {
      const studentRecord = await Student.findOne({ admissionNo: admissionNo.trim() });
      if (studentRecord) {
        studentRef = studentRecord._id;
        studentClass = studentRecord.class;
        resolvedAdmissionNo = studentRecord.admissionNo;
      }
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      generatedPassword: autoPassword, // Store plain-text for admin credentials view
      role,
      mobile: mobile || '',
      employeeId: newEmployeeId,
      admissionNo: resolvedAdmissionNo,
      studentRef: studentRef || undefined,
      studentClass: studentClass || undefined,
      gender: gender || 'Male',
      qualification: qualification || (role === 'TEACHER' ? 'B.Ed.' : ''),
      joiningDate: joiningDate || Date.now(),
      assignedClasses: assignedClasses || [],
      assignedSubjects: assignedSubjects || [],
      status: 'active',
      mustChangePassword: true
    });

    await logActivity(req, 'CREATE_USER', 'User', newUser._id, {
      name: newUser.name, email: newUser.email, role: newUser.role
    });

    res.status(201).json({
      success: true,
      message: `${role} account created successfully.`,
      credentials: {
        email: newUser.email,
        password: autoPassword,
        role: newUser.role
      },
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        admissionNo: newUser.admissionNo,
        employeeId: newUser.employeeId
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/users/bulk-create-students ──────────────────────────────────────
// Bulk create student accounts from all students without portal accounts
// Access: HEAD, PRINCIPAL
router.post('/bulk-create-students', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const students = await Student.find().populate('class', 'name section');
    const created = [];
    const skipped = [];

    for (const student of students) {
      // Check if account already exists
      const existing = await User.findOne({
        $or: [
          { studentRef: student._id },
          { admissionNo: student.admissionNo },
          { email: `${student.admissionNo?.toLowerCase().replace(/[^a-z0-9]/g, '')}@school.local` }
        ]
      });

      if (existing) {
        skipped.push({ name: student.name, reason: 'Account already exists' });
        continue;
      }

      const email = `${(student.admissionNo || student.name.replace(/\s+/g, '').toLowerCase()).replace(/[^a-z0-9]/g, '')}@school.local`;
      const autoPassword = generatePassword(student.name, 'STUDENT', student.admissionNo);

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(autoPassword, salt);

      const newUser = await User.create({
        name: student.name,
        email: email.toLowerCase(),
        passwordHash,
        generatedPassword: autoPassword,
        role: 'STUDENT',
        admissionNo: student.admissionNo || '',
        studentRef: student._id,
        studentClass: student.class?._id || student.class,
        gender: student.gender || 'Male',
        status: 'active',
        mustChangePassword: false
      });

      created.push({
        name: newUser.name,
        email: newUser.email,
        password: autoPassword,
        className: student.class?.name ? `Class ${student.class.name}` : ''
      });
    }

    res.json({
      success: true,
      message: `Created ${created.length} student accounts. Skipped ${skipped.length} (already exist).`,
      created,
      skipped
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/users/:id ────────────────────────────────────────────────────────
// Update user details
// Access: HEAD, PRINCIPAL
router.put('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (req.user.role === 'PRINCIPAL' && userToUpdate.role === 'HEAD') {
      return res.status(403).json({ success: false, message: 'Cannot edit Head Administrator account.' });
    }

    // Check and update email (Gmail)
    if (req.body.email && req.body.email.trim().toLowerCase() !== userToUpdate.email.toLowerCase()) {
      const newEmail = req.body.email.trim().toLowerCase();
      const existingUser = await User.findOne({ _id: { $ne: userToUpdate._id }, email: newEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'This email / Gmail is already in use by another user.' });
      }
      userToUpdate.email = newEmail;
    }

    const allowedFields = ['name', 'mobile', 'qualification', 'gender', 'status', 'assignedClasses', 'assignedSubjects'];
    if (req.user.role === 'HEAD') {
      allowedFields.push('role', 'employeeId', 'admissionNo', 'studentRef', 'studentClass');
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        userToUpdate[field] = req.body[field];
      }
    });

    // If admissionNo is updated for STUDENT, auto-link studentRef
    if (req.body.admissionNo && userToUpdate.role === 'STUDENT') {
      const studentRecord = await Student.findOne({ admissionNo: req.body.admissionNo.trim() });
      if (studentRecord) {
        userToUpdate.studentRef = studentRecord._id;
        userToUpdate.studentClass = studentRecord.class;
      }
    }

    await userToUpdate.save();
    await logActivity(req, 'EDIT_USER', 'User', userToUpdate._id, { name: userToUpdate.name });

    res.json({ success: true, message: 'User updated successfully.', user: userToUpdate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/users/:id/reset-password ───────────────────────────────────────
// Admin resets a user password — auto-generates new one or uses provided
// Access: HEAD, PRINCIPAL
router.put('/:id/reset-password', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (req.user.role === 'PRINCIPAL' && targetUser.role === 'HEAD') {
      return res.status(403).json({ success: false, message: 'Permission denied.' });
    }

    // Auto-generate if no password provided
    const newPassword = req.body.newPassword ||
      generatePassword(targetUser.name, targetUser.role, targetUser.admissionNo || targetUser.employeeId);

    if (req.body.newPassword && req.body.newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const salt = await bcrypt.genSalt(10);
    targetUser.passwordHash = await bcrypt.hash(newPassword, salt);
    targetUser.generatedPassword = newPassword; // Update admin view
    targetUser.mustChangePassword = true;
    await targetUser.save();

    await logActivity(req, 'RESET_PASSWORD', 'User', targetUser._id, { targetEmail: targetUser.email });

    res.json({
      success: true,
      message: `Password for ${targetUser.name} has been reset.`,
      newPassword // Return plain text so admin can note it
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/users/:id/permissions ──────────────────────────────────────────
// Update permissions matrix (HEAD only)
router.put('/:id/permissions', protect, checkRole('HEAD'), async (req, res) => {
  try {
    const { permissions } = req.body;
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    targetUser.permissions = permissions;
    await targetUser.save();
    await logActivity(req, 'UPDATE_PERMISSIONS', 'User', targetUser._id);
    res.json({ success: true, message: 'Permissions updated.', user: targetUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
// Delete user account (HEAD, PRINCIPAL)
router.delete('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }
    if (req.user.role === 'PRINCIPAL' && (targetUser.role === 'HEAD' || targetUser.role === 'PRINCIPAL')) {
      return res.status(403).json({ success: false, message: 'Principals cannot delete Head or Principal accounts.' });
    }
    await User.findByIdAndDelete(req.params.id);
    await logActivity(req, 'DELETE_USER', 'User', targetUser._id, { name: targetUser.name, role: targetUser.role });
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
