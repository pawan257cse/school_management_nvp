const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    // 1. If MONGODB_URI is provided, attempt connection
    if (mongoUri) {
      try {
        console.log('[MongoDB] Connecting to database (MONGODB_URI)...');
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 4000,
        });
        console.log(`[MongoDB] Connected successfully to database: ${conn.connection.host}`);
        return;
      } catch (cloudErr) {
        if (process.env.NODE_ENV === 'production') {
          throw cloudErr;
        }
        console.log('[MongoDB] Configured URI not reachable locally. Falling back to embedded MongoMemoryServer...');
      }
    }

    // 2. In local development zero-setup, start MongoMemoryServer
    const { MongoMemoryServer } = require('mongodb-memory-server');
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
