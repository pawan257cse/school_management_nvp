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
        console.log('[MongoDB] Connecting to Cloud Database (MONGODB_URI)...');
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 8000,
        });
        console.log(`[MongoDB] Connected successfully to live database: ${conn.connection.host}`);
        return;
      } catch (cloudErr) {
        console.error(`[MongoDB Error] Cloud Atlas connection failed: ${cloudErr.message}`);
        if (process.env.NODE_ENV === 'production' || process.env.STRICT_DB === 'true') {
          throw cloudErr;
        }
        console.warn('[MongoDB Warning] Could not connect to Atlas. To prevent data loss, please verify your internet or MONGODB_URI in backend/.env.');
      }
    }

    // 2. Fallback to MongoMemoryServer only if explicitly allowed for local unit tests
    if (process.env.ALLOW_MEMORY_DB === 'true') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB Memory Server] Connected to temporary memory DB: ${conn.connection.host}`);
    } else {
      console.error('[MongoDB Error] Database connection failed and ALLOW_MEMORY_DB is false. Stopping server to prevent RAM data loss.');
      process.exit(1);
    }
  } catch (error) {
    console.error(`[MongoDB Error] Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
