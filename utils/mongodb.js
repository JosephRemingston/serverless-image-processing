const mongoose = require('mongoose');
const getSecrets = require('./aws-secrets.js');

const connectDB = async () => {
    try {
        const secrets = await getSecrets();
        
        /*
        if (!secrets.MONGODB_URI) {
            throw new Error('MongoDB connection string not found in secrets');
        }
        */

        const connection = await mongoose.connect("mongodb+srv://ljremi:remi@cluster0.6ok7t.mongodb.net/serverless_media_processing", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`MongoDB Connected: ${connection.connection.host}`);

        // Handle connection errors after initial connection
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error while closing MongoDB connection:', err);
                process.exit(1);
            }
        });

        return connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
