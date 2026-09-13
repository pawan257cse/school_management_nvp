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

    // For HEAD and PRINCIPAL, never lock out and automatically clear any previous lockouts
    if (user.role === 'HEAD' || user.role === 'PRINCIPAL') {
      if (user.lockUntil || (user.loginAttempts && user.loginAttempts > 0)) {
        user.lockUntil = undefined;
        user.loginAttempts = 0;
        await user.save();
      }
    } else {
      // Check if non-admin account is temporarily locked due to consecutive failed attempts
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        await logActivity(req, 'LOGIN_LOCKED_ATTEMPT', 'User', user._id, { email: user.email, remainingMinutes });
        return res.status(423).json({
          success: false,
          message: `Account temporarily locked due to 5 consecutive failed attempts. Please try again in ${remainingMinutes} minute(s) or contact the Head Administrator.`
        });
      }
    }

    if (user.status !== 'active') {
      await logActivity(req, 'LOGIN_BLOCKED', 'User', user._id, { email, reason: 'Account inactive' });
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact the Head Administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // HEAD and PRINCIPAL accounts are never locked out due to failed attempts
      if (user.role === 'HEAD' || user.role === 'PRINCIPAL') {
        await logActivity(req, 'LOGIN_FAILED', 'User', user._id, { email: user.email, role: user.role });
        return res.status(401).json({
          success: false,
          message: 'Invalid Administrator Login ID or Password. Please check your credentials.'
        });
      }

      // Increment failed login attempts for regular accounts
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

    // Create JWT Token (90-day persistent session for mobile & web)
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '90d' }
    );

    // Audit log
    req.user = user;
    await logActivity(req, 'LOGIN', 'User', user._id, { email: user.email, role: user.role });

    const Class = require('../models/Class');
    let classTeacherOf = [];
    let allAssignedClasses = user.assignedClasses || [];

    if (user.role === 'TEACHER' || user.role === 'PRINCIPAL') {
      const classesWhereCT = await Class.find({
        status: 'active',
        $or: [
          { classTeacher: user._id },
          { attendanceTeacher: user._id },
          { _id: { $in: user.attendanceClasses || [] } }
        ]
      }).select('name section');
      
      classTeacherOf = classesWhereCT.map(c => ({ _id: c._id, name: c.name, section: c.section || 'A' }));

      // Merge and deduplicate assignedClasses
      const classMap = new Map();
      (user.assignedClasses || []).forEach(c => {
        if (c && c._id) classMap.set(c._id.toString(), { _id: c._id, name: c.name, section: c.section || 'A' });
      });
      classesWhereCT.forEach(c => {
        if (c && c._id) classMap.set(c._id.toString(), { _id: c._id, name: c.name, section: c.section || 'A' });
      });
      allAssignedClasses = Array.from(classMap.values());

      // Auto-sync in background to User document
      if (classesWhereCT.length > 0) {
        User.updateOne(
          { _id: user._id },
          { $addToSet: { assignedClasses: { $each: classesWhereCT.map(c => c._id) } } }
        ).catch(() => {});
      }
    }

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
        assignedClasses: allAssignedClasses,
        assignedSubjects: user.assignedSubjects,
        isClassTeacher: user.role === 'HEAD' || user.role === 'PRINCIPAL' || classTeacherOf.length > 0,
        classTeacherOf,
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
  try {
    const user = req.user;
    const Class = require('../models/Class');
    let classTeacherOf = [];
    let allAssignedClasses = user.assignedClasses || [];

    if (user.role === 'TEACHER' || user.role === 'PRINCIPAL') {
      const classesWhereCT = await Class.find({
        status: 'active',
        $or: [
          { classTeacher: user._id },
          { attendanceTeacher: user._id },
          { _id: { $in: user.attendanceClasses || [] } }
        ]
      }).select('name section');
      
      classTeacherOf = classesWhereCT.map(c => ({ _id: c._id, name: c.name, section: c.section || 'A' }));

      // Merge and deduplicate assignedClasses
      const classMap = new Map();
      (user.assignedClasses || []).forEach(c => {
        if (c && c._id) classMap.set(c._id.toString(), { _id: c._id, name: c.name, section: c.section || 'A' });
      });
      classesWhereCT.forEach(c => {
        if (c && c._id) classMap.set(c._id.toString(), { _id: c._id, name: c.name, section: c.section || 'A' });
      });
      allAssignedClasses = Array.from(classMap.values());

      // Auto-sync in background to User document
      if (classesWhereCT.length > 0) {
        User.updateOne(
          { _id: user._id },
          { $addToSet: { assignedClasses: { $each: classesWhereCT.map(c => c._id) } } }
        ).catch(() => {});
      }
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    userObj.isClassTeacher = user.role === 'HEAD' || user.role === 'PRINCIPAL' || classTeacherOf.length > 0;
    userObj.classTeacherOf = classTeacherOf;
    userObj.assignedClasses = allAssignedClasses;

    res.json({
      success: true,
      user: userObj
    });
  } catch (error) {
    res.json({
      success: true,
      user: req.user
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update logged-in user profile (Email/Gmail, Name, Mobile, Qualification)
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { name, email, mobile, qualification } = req.body;

    if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({
        _id: { $ne: user._id },
        email: email.toLowerCase().trim()
      });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'This email / Gmail is already registered with another account.' });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name && name.trim()) user.name = name.trim();
    if (mobile !== undefined) user.mobile = mobile.trim();
    if (qualification !== undefined) user.qualification = qualification.trim();

    await user.save();
    await logActivity(req, 'UPDATE_PROFILE', 'User', user._id, { email: user.email, name: user.name });

    const updatedUser = await User.findById(user._id)
      .populate('assignedClasses')
      .populate('assignedSubjects')
      .populate('studentClass');

    res.json({
      success: true,
      message: 'Profile details updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
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
