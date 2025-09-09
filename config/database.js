const mongoose = require('mongoose');
require('colors');

const logger = {
  database: (message) => console.log(`🗄️  [DATABASE]`.green + ` ${message}`.white),
  error: (message) => console.log(`❌ [ERROR]`.red + ` ${message}`.white),
  success: (message) => console.log(`✅ [SUCCESS]`.green + ` ${message}`.white),
  warning: (message) => console.log(`⚠️  [WARNING]`.yellow + ` ${message}`.white)
};

const connectDB = async () => {
  try {
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    logger.database('Connecting to MongoDB...');
    logger.database(`Connection string: ${process.env.MONGO_URI?.replace(/\/\/.*@/, '//***:***@')}`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    logger.success(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    logger.success(`Database Name: ${conn.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      logger.database('Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      logger.error(`Mongoose connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warning('Mongoose disconnected from MongoDB');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      logger.warning('Closing MongoDB connection due to application termination');
      await mongoose.connection.close();
      logger.success('MongoDB connection closed');
      process.exit(0);
    });
    
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;