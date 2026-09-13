const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// @route   GET /api/announcements
// @desc    Get active announcements
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find({
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ]
    }).sort({ priority: -1, createdAt: -1 });

    res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/announcements
// @desc    Create announcement
// @access  Private (HEAD, PRINCIPAL)
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { title, message, priority, audience, endDate } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const announcement = await Announcement.create({
      title,
      message,
      priority: priority || 'normal',
      audience: audience || 'all',
      endDate: endDate || null,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'Announcement created successfully.', announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (HEAD, PRINCIPAL)
router.delete('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
