require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');

async function unlockAdmins() {
  await connectDB();
  const res = await User.updateMany(
    { role: { $in: ['HEAD', 'PRINCIPAL'] } },
    { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }
  );
  console.log('Unlocked admin accounts count:', res.modifiedCount);
  const users = await User.find({ role: { $in: ['HEAD', 'PRINCIPAL'] } }, 'name email role loginAttempts lockUntil');
  console.log('Current Admin accounts:', users);
  process.exit(0);
}

unlockAdmins().catch(err => {
  console.error(err);
  process.exit(1);
});
