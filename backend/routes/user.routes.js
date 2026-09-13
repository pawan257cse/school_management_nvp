const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const checkPermission = require('../middleware/checkPermission');
const { logActivity } = require('../middleware/auditLogger');

// @route   GET /api/users
// @desc    Get all users with optional filtering (role, status, search)
// @access  Private (HEAD, PRINCIPAL)
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
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    // PRINCIPAL cannot view HEAD super admins
    if (req.user.role === 'PRINCIPAL') {
      query.role = { $ne: 'HEAD' };
    }

    const users = await User.find(query)
      .populate('assignedClasses')
      .populate('assignedSubjects')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/users
// @desc    Create a new Teacher, Principal, or Student account
// @access  Private (HEAD, PRINCIPAL)
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const {
      name, email, temporaryPassword, role, mobile, employeeId,
      gender, qualification, joiningDate, assignedClasses, assignedSubjects,
      admissionNo
    } = req.body;

    if (!name || !email || !temporaryPassword || !role) {
      return res.status(400).json({ success: false, message: 'Name, Email, Role and Temporary Password are required.' });
    }

    // Security Check: PRINCIPAL cannot create HEAD account
    if (req.user.role === 'PRINCIPAL' && role === 'HEAD') {
      return res.status(403).json({ success: false, message: 'Principals are not allowed to create Head Administrator accounts.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(temporaryPassword, salt);

    // For STUDENT accounts: auto-link to Student record by admissionNo
    // This ensures student portal shows the correct class-specific data
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
      role,
      mobile: mobile || '',
      employeeId: employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      admissionNo: resolvedAdmissionNo,
      studentRef: studentRef || undefined,
      studentClass: studentClass || undefined,
      gender: gender || 'Male',
      qualification: qualification || 'B.Ed.',
      joiningDate: joiningDate || Date.now(),
      assignedClasses: assignedClasses || [],
      assignedSubjects: assignedSubjects || [],
      status: 'active',
      mustChangePassword: true
    });

    await logActivity(req, role === 'TEACHER' ? 'CREATE_TEACHER' : 'CREATE_USER', 'User', newUser._id, {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      success: true,
      message: `${role} account created successfully.${studentRef ? ' Student profile linked automatically.' : ''}`,
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user details
// @access  Private (HEAD, PRINCIPAL)
router.put('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // PRINCIPAL cannot edit HEAD users
    if (req.user.role === 'PRINCIPAL' && userToUpdate.role === 'HEAD') {
      return res.status(403).json({ success: false, message: 'Cannot edit Head Administrator account.' });
    }

    const allowedFields = ['name', 'mobile', 'qualification', 'gender', 'status', 'assignedClasses', 'assignedSubjects'];
    if (req.user.role === 'HEAD') {
      allowedFields.push('email', 'role', 'employeeId', 'admissionNo', 'studentRef', 'studentClass');
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        userToUpdate[field] = req.body[field];
      }
    });

    // If admissionNo is being updated for STUDENT, auto-link studentRef
    if (req.body.admissionNo && (userToUpdate.role === 'STUDENT' || req.body.role === 'STUDENT')) {
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

// @route   PUT /api/users/:id/reset-password
// @desc    Admin resets user password
// @access  Private (HEAD, PRINCIPAL)
router.put('/:id/reset-password', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (req.user.role === 'PRINCIPAL' && targetUser.role === 'HEAD') {
      return res.status(403).json({ success: false, message: 'Permission denied.' });
    }

    const salt = await bcrypt.genSalt(10);
    targetUser.passwordHash = await bcrypt.hash(newPassword, salt);
    targetUser.mustChangePassword = true;
    await targetUser.save();

    await logActivity(req, 'RESET_PASSWORD', 'User', targetUser._id, { targetEmail: targetUser.email });

    res.json({ success: true, message: `Password for ${targetUser.name} has been reset.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/:id/permissions
// @desc    Update permissions matrix (HEAD only)
// @access  Private (HEAD only)
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

    res.json({ success: true, message: 'Permissions updated successfully.', user: targetUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private (HEAD only)
router.delete('/:id', protect, checkRole('HEAD'), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own active Head account.' });
    }

    await User.findByIdAndDelete(req.params.id);
    await logActivity(req, 'DELETE_USER', 'User', targetUser._id, { name: targetUser.name, role: targetUser.role });

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
