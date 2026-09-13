const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, JWT_SECRET } = require('../middleware/auth');
const { logActivity } = require('../middleware/auditLogger');

// @route   POST /api/auth/login
// @desc    Authenticate user and get token & role
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    // Find user by email or admissionNo and include passwordHash
    const searchIdentifier = email.trim();
    const user = await User.findOne({
      $or: [
        { email: searchIdentifier.toLowerCase() },
        { admissionNo: searchIdentifier.toUpperCase() }
      ]
    })
      .select('+passwordHash')
      .populate('assignedClasses')
      .populate('assignedSubjects')
      .populate('studentClass')
      .populate('studentRef');

    if (!user) {
      await logActivity(req, 'LOGIN_FAILED', 'User', '', { email, reason: 'Invalid credentials' });
      return res.status(401).json({ success: false, message: 'Invalid email/admission no or password.' });
    }

    if (user.status !== 'active') {
      await logActivity(req, 'LOGIN_BLOCKED', 'User', user._id, { email, reason: 'Account inactive' });
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact the Head Administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await logActivity(req, 'LOGIN_FAILED', 'User', user._id, { email, reason: 'Invalid password' });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Create JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Audit log
    req.user = user;
    await logActivity(req, 'LOGIN', 'User', user._id, { email: user.email, role: user.role });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        employeeId: user.employeeId,
        admissionNo: user.admissionNo,
        studentRef: user.studentRef,
        studentClass: user.studentClass,
        gender: user.gender,
        qualification: user.qualification,
        joiningDate: user.joiningDate,
        profilePhoto: user.profilePhoto,
        mustChangePassword: user.mustChangePassword,
        permissions: user.permissions,
        assignedClasses: user.assignedClasses,
        assignedSubjects: user.assignedSubjects,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// @route   POST /api/auth/change-password
// @desc    User changes own password
// @access  Private
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;
    user.generatedPassword = ''; // Clear admin-visible temp password — user now owns their password
    await user.save();

    await logActivity(req, 'CHANGE_PASSWORD', 'User', user._id);

    res.json({ success: true, message: 'Password changed successfully. You can now use your new password to log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user & log event
// @access  Private
router.post('/logout', protect, async (req, res) => {
  await logActivity(req, 'LOGOUT', 'User', req.user._id);
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
