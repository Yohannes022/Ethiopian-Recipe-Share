const mongoose = require('mongoose');
const colors = require('colors');
const config = require('./config');

// Remove Mongoose deprecation warnings
mongoose.set('strictQuery', true);

// Connection events
mongoose.connection.on('connected', () => {
  console.log(colors.green.bold('MongoDB connected successfully'));
});

mongoose.connection.on('error', (err) => {
  console.error(colors.red.bold(`MongoDB connection error: ${err.message}`));
  // In production, you might want to implement reconnection logic here
  if (process.env.NODE_ENV === 'production') {
    setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
  }
});

mongoose.connection.on('disconnected', () => {
  console.log(colors.yellow.bold('MongoDB disconnected'));
});

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log(colors.red.bold('MongoDB connection closed due to app termination'));
  process.exit(0);
});

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  family: 4, // Use IPv4, skip trying IPv6
};

/**
 * Connect to MongoDB
 * @returns {Promise<typeof mongoose>} Mongoose connection
 */
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log(colors.blue.bold('Using existing database connection'));
      return mongoose.connection;
    }

    console.log(colors.blue.bold('Creating new database connection...'));
    
    const conn = await mongoose.connect(config.mongoUri, options);
    
    console.log(
      colors.cyan.underline.bold(
        `MongoDB Connected: ${conn.connection.host}`
      )
    );
    
    return conn;
  } catch (error) {
    console.error(colors.red.bold(`MongoDB connection error: ${error.message}`));
    
    // In production, you might want to implement a retry mechanism
    if (process.env.NODE_ENV === 'production') {
      console.log(colors.yellow.bold('Retrying connection in 5 seconds...'));
      setTimeout(connectDB, 5000);
    } else {
      // Exit process with failure in development
      process.exit(1);
    }
  }
};

// Export the connection and mongoose
module.exports = {
  connectDB,
  connection: mongoose.connection,
  mongoose,
};
