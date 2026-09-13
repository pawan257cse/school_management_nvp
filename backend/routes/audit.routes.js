const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// @route   GET /api/audit/logs
// @desc    Get audit activity logs with date range and search filters
// @access  Private (HEAD only)
router.get('/logs', protect, checkRole('HEAD'), async (req, res) => {
  try {
    const { filter, startDate, endDate, role, search } = req.query;
    let query = {};

    // Date range filter
    const now = new Date();
    if (filter === 'today') {
      const today = new Date(now.setHours(0,0,0,0));
      query.createdAt = { $gte: today };
    } else if (filter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0,0,0,0);
      const endYesterday = new Date(yesterday);
      endYesterday.setHours(23,59,59,999);
      query.createdAt = { $gte: yesterday, $lte: endYesterday };
    } else if (filter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.createdAt = { $gte: sevenDaysAgo };
    } else if (filter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    } else if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (role) {
      query.userRole = role;
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { entity: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/audit/login-history
// @desc    Get login history with filters
// @access  Private (HEAD only)
router.get('/login-history', protect, checkRole('HEAD'), async (req, res) => {
  try {
    const { filter, role, search } = req.query;
    let query = { action: { $in: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'LOGIN_BLOCKED'] } };

    const now = new Date();
    if (filter === 'today') {
      const today = new Date(now.setHours(0,0,0,0));
      query.createdAt = { $gte: today };
    } else if (filter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.createdAt = { $gte: sevenDaysAgo };
    } else if (filter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    if (role) {
      query.userRole = role;
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const logins = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ success: true, count: logins.length, logins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
