/** @format */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/database");
const { testConnection } = require("./config/cloudinary");
// const errorHandler = require("./middleware/errorHandler");

// Import routes
const portfolioRoutes = require("../routes/portfolio/index");
const adminRoutes = require("../routes/admin/index");
const errorHandler = require("../middleware/errorHandler");
const apiLogger = require("../middleware/apiLog");

// Initialize app
const app = express();

// Connect to Database
connectDB();

// Test Cloudinary connection
testConnection();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", true);

// CORS configuration
const corsOptions = {
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_PANEL_URL, process.env.ADMIN_PANEL_URL_2],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiter to all routes
app.use("/api/", limiter);

// API Logger
app.use(apiLogger);

// Health check route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Portfolio API is running",
        version: "1.0.0",
        environment: process.env.NODE_ENV,
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "API is healthy",
        timestamp: new Date().toISOString(),
    });
});

// Mount routes
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl,
    });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`\n✅ Server started successfully!\n`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on("SIGTERM", () => {
    console.log("👋 SIGTERM received. Shutting down gracefully...");
    server.close(() => {
        console.log("✅ Process terminated");
    });
});

module.exports = app;
