const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agritrace';
  
  try {
    // Attempt connecting to the configured MongoDB instance with a short timeout
    console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('✅ [Database] MongoDB successfully connected.');
    return { type: 'standard', uri };
  } catch (err) {
    console.warn(`⚠️ [Database] Could not connect to local/configured MongoDB: ${err.message}`);
    console.log('🔄 [Database] Starting MongoMemoryServer for instant zero-config offline/demo operation...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      
      await mongoose.connect(memoryUri);
      console.log(`✅ [Database] In-memory MongoDB initialized and connected at: ${memoryUri}`);
      
      // Seed data automatically when using in-memory DB so user has immediate rich data
      const seedDatabase = require('../seed/seedData');
      await seedDatabase({ silent: false });

      return { type: 'in-memory', uri: memoryUri };
    } catch (memErr) {
      console.error('❌ [Database] Failed to start in-memory MongoDB:', memErr);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
