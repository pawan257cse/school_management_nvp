const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    // 1. If MONGODB_URI is provided (Cloud Atlas or Custom URI), connect to it
    if (mongoUri) {
      console.log('[MongoDB] Connecting to cloud database (MONGODB_URI)...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`[MongoDB] Connected successfully to cloud database: ${conn.connection.host}`);
      return;
    }

    // 2. In local development, try local MongoDB service first
    const localUri = 'mongodb://127.0.0.1:27017/nvp_school';
    try {
      const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2500 });
      console.log(`[MongoDB] Connected successfully to local database: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.log('[MongoDB] Local MongoDB service not active. Starting embedded MongoMemoryServer...');
    }

    // 3. Fallback to MongoMemoryServer for development zero-setup
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
