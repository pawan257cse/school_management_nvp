const mongoose = require('mongoose');
const { Resolver } = require('dns').promises;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      try {
        console.log('[MongoDB] Connecting to Cloud Database (MONGODB_URI)...');
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 8000,
        });
        console.log(`[MongoDB] Connected successfully to live database: ${conn.connection.host}`);
        return;
      } catch (cloudErr) {
        console.warn(`[MongoDB Warning] Standard SRV connection failed (${cloudErr.message}). Attempting custom DNS resolution...`);
        
        try {
          if (mongoUri.startsWith('mongodb+srv://')) {
            const urlObj = new URL(mongoUri.replace('mongodb+srv://', 'http://'));
            const srvHost = urlObj.hostname;
            const authPart = urlObj.username ? `${urlObj.username}:${urlObj.password}@` : '';
            const dbName = urlObj.pathname.replace(/^\//, '') || 'nvp_school';

            const resolver = new Resolver();
            resolver.setServers(['8.8.8.8', '1.1.1.1']);
            const srvs = await resolver.resolveSrv(`_mongodb._tcp.${srvHost}`);

            if (srvs && srvs.length > 0) {
              const directHosts = srvs.map(s => `${s.name}:${s.port}`).join(',');
              const directUri = `mongodb://${authPart}${directHosts}/${dbName}?ssl=true&authSource=admin&retryWrites=true&w=majority`;

              console.log('[MongoDB] Connecting to Cloud Database via direct DNS resolved hosts...');
              const conn = await mongoose.connect(directUri, {
                serverSelectionTimeoutMS: 15000
              });
              console.log(`[MongoDB] Connected successfully to live persistent database: ${conn.connection.host}`);
              return;
            }
          }
        } catch (directDnsErr) {
          console.error(`[MongoDB Error] Direct DNS fallback failed: ${directDnsErr.message}`);
        }

        if (process.env.NODE_ENV === 'production' || process.env.STRICT_DB === 'true') {
          throw cloudErr;
        }
      }
    }

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
