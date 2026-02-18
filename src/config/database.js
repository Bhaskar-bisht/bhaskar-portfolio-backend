/** @format */

require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");

// Use Google's DNS servers (helps with connection issues)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
    try {
        // Add more detailed logging
        console.log("🔄 Connecting to MongoDB...");

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000, // Increase timeout to 15 seconds
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4 - IMPORTANT!
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on("connected", () => {
    console.log("🔗 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error(`❌ Mongoose connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
    console.log("⚠️ Mongoose disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("🛑 Mongoose connection closed through app termination");
    process.exit(0);
});

module.exports = connectDB;
