const mongoose = require('mongoose');
const { hasRealMongoUri } = require('./mockDb');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!hasRealMongoUri()) {
    console.warn('MongoDB connection skipped: MONGO_URI is not configured.');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
