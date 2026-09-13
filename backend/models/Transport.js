const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  vehicleNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['School Bus', 'Bus', 'Mini Bus', 'Van', 'Winger'],
    default: 'School Bus'
  },
  routeTitle: {
    type: String,
    required: true,
    trim: true
  },
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  driverPhone: {
    type: String,
    required: true,
    trim: true
  },
  conductorName: {
    type: String,
    trim: true
  },
  conductorPhone: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 32
  },
  assignedStudentsCount: {
    type: Number,
    default: 0
  },
  monthlyFee: {
    type: Number,
    required: true,
    default: 1000
  },
  pickupPoints: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transport', transportSchema);
