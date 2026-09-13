const express = require('express');
const router = express.Router();
const Parent = require('../models/Parent');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get all parents with search
router.get('/', protect, async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { occupation: { $regex: search, $options: 'i' } }
      ];
    }

    const parents = await Parent.find(query)
      .populate({
        path: 'students',
        select: 'name rollNo admissionNo class',
        populate: { path: 'class', select: 'name section' }
      })
      .sort({ name: 1 });

    res.json({ success: true, count: parents.length, parents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new parent
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { name, relation, phone, email, occupation, address, students } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone Number are required.' });
    }

    const parent = await Parent.create({
      name,
      relation: relation || 'Father',
      phone,
      email,
      occupation,
      address,
      students: students || []
    });

    res.status(201).json({ success: true, message: 'Parent profile registered.', parent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update parent
router.put('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const parent = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('students');

    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent record not found.' });
    }

    res.json({ success: true, message: 'Parent details updated.', parent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete parent
router.delete('/:id', protect, checkRole('HEAD'), async (req, res) => {
  try {
    const parent = await Parent.findByIdAndDelete(req.params.id);
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent record not found.' });
    }
    res.json({ success: true, message: 'Parent deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
