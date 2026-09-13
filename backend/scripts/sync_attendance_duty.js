require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = require('../config/db');
const User = require('../models/User');
const Class = require('../models/Class');

async function syncAttendanceDuty() {
  await connectDB();
  const classes = await Class.find().populate('classTeacher');
  for (const c of classes) {
    if (c.classTeacher) {
      c.attendanceTeacher = c.classTeacher._id;
      await c.save();
      await User.findByIdAndUpdate(c.classTeacher._id, {
        $addToSet: { attendanceClasses: c._id }
      });
      console.log(`Linked Attendance In-charge for Class ${c.name} -> ${c.classTeacher.name}`);
    }
  }
  console.log('Attendance duty sync complete.');
  process.exit(0);
}

syncAttendanceDuty().catch(err => {
  console.error(err);
  process.exit(1);
});
