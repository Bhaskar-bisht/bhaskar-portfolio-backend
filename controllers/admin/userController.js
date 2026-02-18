/** @format */

const User = require("../../src/models/User");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinaryUpload");

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        let query = {};

        if (search) {
            query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await User.countDocuments(query);

        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message,
        });
    }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private
exports.getById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

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

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const updateData = { ...req.body };
        delete updateData.password; // Don't allow password update here

        // Handle avatar upload
        if (req.files && req.files.avatar) {
            // Delete old avatar
            if (user.avatar && user.avatar.publicId) {
                await deleteFromCloudinary(user.avatar.publicId);
            }
            // Upload new avatar
            const result = await uploadToCloudinary(req.files.avatar[0].buffer, "portfolio/avatars");
            updateData.avatar = {
                publicId: result.publicId,
                url: result.url,
            };
        }

        // Handle resume upload
        if (req.files && req.files.resume) {
            // Delete old resume
            if (user.resume && user.resume.publicId) {
                await deleteFromCloudinary(user.resume.publicId);
            }
            // Upload new resume
            const result = await uploadToCloudinary(req.files.resume[0].buffer, "portfolio/resumes");
            updateData.resume = {
                publicId: result.publicId,
                url: result.url,
            };
        }

        user = await User.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message,
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private
exports.delete = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Don't allow deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete yourself",
            });
        }

        // Delete images from Cloudinary
        if (user.avatar && user.avatar.publicId) {
            await deleteFromCloudinary(user.avatar.publicId);
        }

        if (user.resume && user.resume.publicId) {
            await deleteFromCloudinary(user.resume.publicId);
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message,
        });
    }
};
