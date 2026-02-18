/** @format */

const Experience = require("../../src/models/Experience");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinaryUpload");

// @desc    Get all experiences
// @route   GET /api/admin/experiences
// @access  Private
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, userId, current } = req.query;

        let query = {};

        if (userId) {
            query.userId = userId;
        }

        if (current !== undefined) {
            query.isCurrent = current === "true";
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Experience.countDocuments(query);

        const experiences = await Experience.find(query)
            .populate("userId", "name email")
            .populate("technologies", "name logo")
            .sort({ isCurrent: -1, startDate: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        res.status(200).json({
            success: true,
            data: experiences,
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
            message: "Error fetching experiences",
            error: error.message,
        });
    }
};

// @desc    Get single experience
// @route   GET /api/admin/experiences/:id
// @access  Private
exports.getById = async (req, res) => {
    try {
        const experience = await Experience.findById(req.params.id)
            .populate("userId", "name email")
            .populate("technologies", "name logo");

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: "Experience not found",
            });
        }

        res.status(200).json({
            success: true,
            data: experience,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching experience",
            error: error.message,
        });
    }
};

// @desc    Create experience
// @route   POST /api/admin/experiences
// @access  Private
exports.create = async (req, res) => {
    try {
        const experienceData = { ...req.body };

        // Use logged in user if userId not provided
        if (!experienceData.userId) {
            experienceData.userId = req.user._id;
        }

        // Parse technologies if it's a string
        if (typeof experienceData.technologies === "string") {
            experienceData.technologies = JSON.parse(experienceData.technologies);
        }

        // Parse achievements if it's a string
        if (typeof experienceData.achievements === "string") {
            experienceData.achievements = JSON.parse(experienceData.achievements);
        }

        // Handle company logo upload
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, "portfolio/experiences");
            experienceData.companyLogo = {
                publicId: result.publicId,
                url: result.url,
            };
        }

        const experience = await Experience.create(experienceData);

        // Populate before sending
        await experience.populate("userId", "name email");
        await experience.populate("technologies", "name logo");

        res.status(201).json({
            success: true,
            message: "Experience created successfully",
            data: experience,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating experience",
            error: error.message,
        });
    }
};

// @desc    Update experience
// @route   PUT /api/admin/experiences/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        let experience = await Experience.findById(req.params.id);

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: "Experience not found",
            });
        }

        const updateData = { ...req.body };

        // Parse arrays if they're strings
        if (typeof updateData.technologies === "string") {
            updateData.technologies = JSON.parse(updateData.technologies);
        }

        if (typeof updateData.achievements === "string") {
            updateData.achievements = JSON.parse(updateData.achievements);
        }

        // Handle company logo update
        if (req.file) {
            // Delete old logo
            if (experience.companyLogo && experience.companyLogo.publicId) {
                await deleteFromCloudinary(experience.companyLogo.publicId);
            }
            // Upload new logo
            const result = await uploadToCloudinary(req.file.buffer, "portfolio/experiences");
            updateData.companyLogo = {
                publicId: result.publicId,
                url: result.url,
            };
        }

        experience = await Experience.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate("userId", "name email")
            .populate("technologies", "name logo");

        res.status(200).json({
            success: true,
            message: "Experience updated successfully",
            data: experience,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating experience",
            error: error.message,
        });
    }
};

// @desc    Delete experience
// @route   DELETE /api/admin/experiences/:id
// @access  Private
exports.delete = async (req, res) => {
    try {
        const experience = await Experience.findById(req.params.id);

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: "Experience not found",
            });
        }

        // Delete company logo from Cloudinary
        if (experience.companyLogo && experience.companyLogo.publicId) {
            await deleteFromCloudinary(experience.companyLogo.publicId);
        }

        await Experience.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Experience deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting experience",
            error: error.message,
        });
    }
};
