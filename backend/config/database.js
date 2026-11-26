const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-cyber-defense';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // Fast 3s timeout for local mongo
    });
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(`⚠️ Local MongoDB not found on ${uri}: ${error.message}`);
    logger.warn(`🔄 Attempting In-Memory MongoDB fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      logger.info(`✅ In-Memory MongoDB Connected: ${memoryUri}`);
    } catch (memErr) {
      logger.warn(`⚠️ In-Memory MongoDB unavailable: ${memErr.message}. Running in volatile memory mode.`);
    }
  }
};

module.exports = connectDB;
