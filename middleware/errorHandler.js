/** @format */

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for dev
    if (process.env.NODE_ENV === "development") {
        console.error("❌ Error:", err);
    }

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        const message = "Resource not found";
        error.statusCode = 404;
        error.message = message;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const message = `Duplicate field value: ${field}. Please use another value.`;
        error.statusCode = 400;
        error.message = message;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
        error.statusCode = 400;
        error.message = message;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        error.statusCode = 401;
        error.message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        error.statusCode = 401;
        error.message = "Token expired";
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Server Error",
        error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};

module.exports = errorHandler;
