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
      return res.status(400).json({ success: false, message: 'Please provide both ID/Email and password.' });
    }

    // Find user by email, admissionNo, employeeId, or mobile number
    const searchIdentifier = email.trim();
    const cleanId = searchIdentifier.toLowerCase();
    const cleanUpper = searchIdentifier.toUpperCase();

    const user = await User.findOne({
      $or: [
        { email: cleanId },
        { admissionNo: cleanUpper },
        { admissionNo: searchIdentifier },
        { employeeId: cleanUpper },
        { employeeId: searchIdentifier },
        { mobile: searchIdentifier }
      ]
    })
      .select('+passwordHash')
      .populate('assignedClasses')
      .populate('assignedSubjects')
      .populate('studentClass')
      .populate('studentRef');

    if (!user) {
      await logActivity(req, 'LOGIN_FAILED', 'User', '', { email, reason: 'User not found' });
      return res.status(401).json({ success: false, message: 'Invalid Login ID / Email or password.' });
    }

    // Check if account is temporarily locked due to consecutive failed attempts
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      await logActivity(req, 'LOGIN_LOCKED_ATTEMPT', 'User', user._id, { email: user.email, remainingMinutes });
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked due to 5 consecutive failed attempts. Please try again in ${remainingMinutes} minute(s) or contact the Head Administrator.`
      });
    }

    if (user.status !== 'active') {
      await logActivity(req, 'LOGIN_BLOCKED', 'User', user._id, { email, reason: 'Account inactive' });
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact the Head Administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Increment failed login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lockout
        await user.save();
        await logActivity(req, 'ACCOUNT_LOCKED', 'User', user._id, { email: user.email, attempts: user.loginAttempts });
        return res.status(423).json({
          success: false,
          message: 'Account temporarily locked for 15 minutes due to 5 consecutive failed login attempts.'
        });
      }

      await user.save();
      await logActivity(req, 'LOGIN_FAILED', 'User', user._id, { email: user.email, attempts: user.loginAttempts });
      const attemptsRemaining = 5 - user.loginAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid Login ID or Password. (${attemptsRemaining} attempt(s) remaining before temporary lockout).`
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
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
    user.generatedPassword = newPassword; // Retain current password for Head & Principal live administrative oversight
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

// @route   POST /api/auth/admin-recovery-reset
// @desc    Emergency password reset for HEAD / Administrator using Master Recovery Key
// @access  Public (protected by Master Recovery Key)
router.post('/admin-recovery-reset', async (req, res) => {
  try {
    const { email, recoveryKey, newPassword } = req.body;

    if (!email || !recoveryKey || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields (Admin Email, Master Recovery Key, New Password) are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    // Verify master recovery key against environment variable or secure system key
    const expectedKey = process.env.ADMIN_RECOVERY_KEY || 'NVP-HEAD-RECOVERY-KEY-2026';
    if (recoveryKey.trim() !== expectedKey.trim()) {
      await logActivity(req, 'ADMIN_RECOVERY_FAILED', 'User', '', { email, reason: 'Invalid Master Recovery Key' });
      return res.status(403).json({ success: false, message: 'Invalid Master Recovery Key. Please check the key in your server environment settings.' });
    }

    // Find HEAD user
    const headUser = await User.findOne({
      role: 'HEAD',
      email: email.trim().toLowerCase()
    }).select('+passwordHash');

    if (!headUser) {
      return res.status(404).json({ success: false, message: 'Head Administrator account with this email was not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    headUser.passwordHash = await bcrypt.hash(newPassword, salt);
    headUser.mustChangePassword = false;
    headUser.generatedPassword = '';
    await headUser.save();

    await logActivity(req, 'ADMIN_RECOVERY_SUCCESS', 'User', headUser._id, { email, note: 'Admin password reset via Master Recovery Key' });

    res.json({
      success: true,
      message: 'Head Administrator password has been reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
