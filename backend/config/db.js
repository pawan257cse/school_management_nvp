const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS fallback for MongoDB Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setting DNS servers is restricted
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    // 1. If MONGODB_URI is provided, attempt connection
    if (mongoUri) {
      try {
        console.log('[MongoDB] Connecting to database (MONGODB_URI)...');
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 8000,
        });
        console.log(`[MongoDB] Connected successfully to database: ${conn.connection.host}`);
        return;
      } catch (cloudErr) {
        console.warn(`[MongoDB Warning] Cloud connection attempt failed: ${cloudErr.message}`);
        if (process.env.NODE_ENV === 'production') {
          throw cloudErr;
        }
        console.log('[MongoDB] Falling back to embedded MongoMemoryServer for local development...');
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
