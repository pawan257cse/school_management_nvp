const mongoose = require('mongoose');
const dns = require('dns');
const { Resolver } = require('dns').promises;

// Set Google & Cloudflare DNS globally to fix Windows node.js SRV lookup failures
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if not allowed
}

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('[MongoDB Fatal] MONGODB_URI is not defined in environment variables!');
    process.exit(1);
  }

  // Attempt standard connection up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[MongoDB] Connecting to Persistent Live Database (Attempt ${attempt})...`);
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`[MongoDB] Successfully connected to live persistent database: ${conn.connection.host}`);
      return;
    } catch (cloudErr) {
      console.warn(`[MongoDB Warning] Connection attempt ${attempt} failed: ${cloudErr.message}`);
      if (attempt < 3) {
        await new Promise(res => setTimeout(res, 2000));
      } else {
        // Final fallback: Direct DNS SRV host resolution
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

              console.log('[MongoDB] Connecting via direct DNS resolved hosts...');
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

        console.error('[MongoDB Fatal Error] Could not connect to MongoDB Atlas persistent storage. Server will not run on temporary memory to avoid data loss.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
