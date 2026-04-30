const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // MongoDB Atlas connection options for better performance
        const options = {
            maxPoolSize: 10, // Maximum number of connections in the connection pool
            serverSelectionTimeoutMS: 5000, // Timeout for server selection
            socketTimeoutMS: 45000, // Timeout for socket operations
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
