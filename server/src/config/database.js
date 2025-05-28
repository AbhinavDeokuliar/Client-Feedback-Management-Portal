const mongoose = require('mongoose');
const winston = require('winston');

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6+ doesn't need these options anymore, they're enabled by default
    });

    winston.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    winston.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Execute connection
connectDB();

// Connection events for monitoring
mongoose.connection.on('connected', () => {
  winston.info('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  winston.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  winston.info('MongoDB disconnected');
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  winston.info('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = {
  connectDB
};
