const mongoose = require('mongoose');

const connectDB = async (retryCount = 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    
    if (retryCount > 0) {
      console.log(`Retrying connection in 5 seconds... (${retryCount} retries left)`);
      setTimeout(() => connectDB(retryCount - 1), 5000);
    } else {
      console.error('Failed to connect to MongoDB after multiple attempts.');
      // Keep server running but mark as disconnected
    }
  }
};

module.exports = connectDB;
