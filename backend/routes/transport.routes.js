const express = require('express');
const router = express.Router();
const Transport = require('../models/Transport');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get all transport vehicles & routes
router.get('/', protect, async (req, res) => {
  try {
    const transports = await Transport.find().sort({ vehicleNo: 1 });

    const totalVehicles = transports.length;
    const totalCapacity = transports.reduce((sum, v) => sum + (v.capacity || 0), 0);
    const totalStudentsCommuting = transports.reduce((sum, v) => sum + (v.assignedStudentsCount || 0), 0);
    const estimatedMonthlyRevenue = transports.reduce((sum, v) => sum + ((v.assignedStudentsCount || 0) * (v.monthlyFee || 0)), 0);

    res.json({
      success: true,
      summary: {
        totalVehicles,
        totalCapacity,
        totalStudentsCommuting,
        estimatedMonthlyRevenue
      },
      transports,
      vehicles: transports,
      data: transports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new vehicle / route
router.post('/', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const {
      vehicleNo,
      vehicleType,
      routeTitle,
      driverName,
      driverPhone,
      conductorName,
      conductorPhone,
      capacity,
      assignedStudentsCount,
      monthlyFee,
      pickupPoints,
      status
    } = req.body;

    if (!vehicleNo || !routeTitle || !driverName || !driverPhone) {
      return res.status(400).json({ success: false, message: 'Vehicle No, Route Title, Driver Name and Phone are required.' });
    }

    const existing = await Transport.findOne({ vehicleNo });
    if (existing) {
      return res.status(400).json({ success: false, message: `Vehicle ${vehicleNo} already exists.` });
    }

    const transport = await Transport.create({
      vehicleNo,
      vehicleType: vehicleType || 'School Bus',
      routeTitle,
      driverName,
      driverPhone,
      conductorName: conductorName || '',
      conductorPhone: conductorPhone || '',
      capacity: Number(capacity) || 32,
      assignedStudentsCount: Number(assignedStudentsCount) || 0,
      monthlyFee: Number(monthlyFee) || 1000,
      pickupPoints: Array.isArray(pickupPoints) ? pickupPoints : (pickupPoints ? pickupPoints.split(',').map(s => s.trim()) : []),
      status: status || 'active'
    });

    res.status(201).json({ success: true, message: 'Transport route created.', transport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update vehicle / route
router.put('/:id', protect, checkRole('HEAD', 'PRINCIPAL'), async (req, res) => {
  try {
    const transport = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!transport) {
      return res.status(404).json({ success: false, message: 'Transport record not found.' });
    }
    res.json({ success: true, message: 'Transport record updated.', transport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete vehicle
router.delete('/:id', protect, checkRole('HEAD'), async (req, res) => {
  try {
    const transport = await Transport.findByIdAndDelete(req.params.id);
    if (!transport) {
      return res.status(404).json({ success: false, message: 'Transport record not found.' });
    }
    res.json({ success: true, message: 'Transport record deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
