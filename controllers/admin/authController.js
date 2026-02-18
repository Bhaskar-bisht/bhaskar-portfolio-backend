/** @format */

const User = require("../../src/models/User");
const { getSignedJwtToken } = require("../../middleware/auth");

// @desc    Register new admin user
// @route   POST /api/admin/auth/register
// @access  Public (but should be restricted - only allow first user)
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        // Check if any user exists (only allow one admin)
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            return res.status(403).json({
                success: false,
                message: "Admin user already exists. Please login.",
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: "admin",
        });

        // Generate JWT token
        const token = getSignedJwtToken(user._id);

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error during registration",
            error: error.message,
        });
    }
};

// @desc    Login user
// @route   POST /api/admin/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
        }

        // Check for user (include password field)
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // Generate JWT token
        const token = getSignedJwtToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error during login",
            error: error.message,
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/admin/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message,
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/admin/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email,
            bio: req.body.bio,
            tagline: req.body.tagline,
            currentPosition: req.body.currentPosition,
            yearsOfExperience: req.body.yearsOfExperience,
            location: req.body.location,
            timezone: req.body.timezone,
            availabilityStatus: req.body.availabilityStatus,
            githubUrl: req.body.githubUrl,
            linkedinUrl: req.body.linkedinUrl,
            twitterUrl: req.body.twitterUrl,
            behanceUrl: req.body.behanceUrl,
            dribbbleUrl: req.body.dribbbleUrl,
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach((key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

        const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message,
        });
    }
};

// @desc    Update password
// @route   PUT /api/admin/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide current and new password",
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select("+password");

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating password",
            error: error.message,
        });
    }
};

// @desc    Logout user
// @route   POST /api/admin/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        // In JWT, we just send success response
        // Client should remove token from storage
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error during logout",
            error: error.message,
        });
    }
};
