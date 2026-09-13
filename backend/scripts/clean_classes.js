require('dotenv').config();
const connectDB = require('../config/db');
const Class = require('../models/Class');

async function cleanClasses() {
  await connectDB();
  const res = await Class.deleteMany({ name: { $in: ['Nursery', '8', '9', '10'] } });
  console.log('Removed unused classes count:', res.deletedCount);
  const remaining = await Class.find({}, 'name section');
  console.log('Final Active Classes:', remaining.map(c => c.name));
  process.exit(0);
}

cleanClasses().catch(err => {
  console.error(err);
  process.exit(1);
});
