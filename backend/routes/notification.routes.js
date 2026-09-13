const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    const notifications = await Notification.find({
      $or: [
        { recipientRole: 'ALL' },
        { recipientRole: userRole },
        { recipientUser: userId }
      ]
    })
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/notifications
// @desc    Send notification
// @access  Private (HEAD, PRINCIPAL)
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { recipientRole, recipientUser, recipientClass, title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Notification title and message are required.' });
    }

    const notification = await Notification.create({
      sender: req.user._id,
      recipientRole: recipientRole || 'ALL',
      recipientUser: recipientUser || null,
      recipientClass: recipientClass || null,
      title,
      message,
      type: type || 'info'
    });

    res.status(201).json({ success: true, message: 'Notification dispatched successfully.', notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
