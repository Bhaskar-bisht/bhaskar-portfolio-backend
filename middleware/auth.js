/** @format */

const jwt = require("jsonwebtoken");
const User = require("../src/models/User");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized to access this route. Please login.",
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid or expired",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error in authentication",
            error: error.message,
        });
    }
};

// Check if user is admin
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

// Generate JWT token
exports.getSignedJwtToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "30d",
    });
};
