require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const newPassword = process.argv[2] || 'Head@12345';

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nvp_school';
    console.log(`Connecting to database...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

    const headUser = await User.findOne({ role: 'HEAD' }).select('+passwordHash');
    if (!headUser) {
      console.error('[Error] No user with role HEAD found in the database.');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    headUser.passwordHash = await bcrypt.hash(newPassword, salt);
    headUser.mustChangePassword = false;
    headUser.generatedPassword = '';
    await headUser.save();

    console.log(`====================================================`);
    console.log(`  HEAD ADMINISTRATOR PASSWORD RESET SUCCESSFULLY!   `);
    console.log(`  Login Email : ${headUser.email}`);
    console.log(`  New Password: ${newPassword}`);
    console.log(`====================================================`);
    process.exit(0);
  } catch (err) {
    console.error('[Error] Failed to reset admin password:', err.message);
    process.exit(1);
  }
};

run();
