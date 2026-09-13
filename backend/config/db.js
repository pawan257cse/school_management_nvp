const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nvp_school';
    
    // Attempt connecting to configured MONGODB_URI first
    try {
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`[MongoDB] Connected successfully to local database: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.log('[MongoDB] Local MongoDB connection failed or not running. Falling back to embedded MongoMemoryServer...');
    }

    // Fallback to MongoMemoryServer for out-of-the-box zero setup execution
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB Memory Server] Connected successfully to memory DB instance: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
