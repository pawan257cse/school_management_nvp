const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get all staff members with search/dept filter
router.get('/', protect, async (req, res) => {
  try {
    const { department, search, status } = req.query;
    const query = {};

    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const staffList = await Staff.find(query).sort({ employeeId: 1 });
    res.json({ success: true, count: staffList.length, staff: staffList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new staff member
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const { employeeId, name, designation, department, gender, phone, email, joiningDate, salary, status } = req.body;

    if (!name || !designation || !phone) {
      return res.status(400).json({ success: false, message: 'Name, Designation and Phone are required.' });
    }

    let finalEmpId = employeeId;
    if (!finalEmpId) {
      const count = await Staff.countDocuments();
      finalEmpId = `EMP-S${String(count + 101).padStart(3, '0')}`;
    }

    const existing = await Staff.findOne({ employeeId: finalEmpId });
    if (existing) {
      return res.status(400).json({ success: false, message: `Staff ID ${finalEmpId} is already in use.` });
    }

    const staff = await Staff.create({
      employeeId: finalEmpId,
      name,
      designation,
      department: department || 'General Administration',
      gender: gender || 'Male',
      phone,
      email,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      salary: salary || 0,
      status: status || 'active'
    });

    res.status(201).json({ success: true, message: 'Staff member registered successfully.', staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update staff member
router.put('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }
    res.json({ success: true, message: 'Staff details updated.', staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete staff member
router.delete('/:id', protect, checkRole('HEAD'), async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }
    res.json({ success: true, message: 'Staff record deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
