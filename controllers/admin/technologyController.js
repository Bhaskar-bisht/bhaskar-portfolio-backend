/** @format */

const Technology = require("../../src/models/Technology");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinaryUpload");
const { generateUniqueSlug } = require("../../utils/slugify");

// @desc    Get all technologies
// @route   GET /api/admin/technologies
// @access  Private
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, category, featured } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (category) {
            query.category = category;
        }

        if (featured !== undefined) {
            query.isFeatured = featured === "true";
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Technology.countDocuments(query);

        const technologies = await Technology.find(query)
            .sort({ displayOrder: 1, name: 1 })
            .limit(parseInt(limit))
            .skip(skip);

        res.status(200).json({
            success: true,
            data: technologies,
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
            message: "Error fetching technologies",
            error: error.message,
        });
    }
};

// @desc    Get single technology
// @route   GET /api/admin/technologies/:id
// @access  Private
exports.getById = async (req, res) => {
    try {
        const technology = await Technology.findById(req.params.id);

        if (!technology) {
            return res.status(404).json({
                success: false,
                message: "Technology not found",
            });
        }

        res.status(200).json({
            success: true,
            data: technology,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching technology",
            error: error.message,
        });
    }
};

// @desc    Create technology
// @route   POST /api/admin/technologies
// @access  Private
exports.create = async (req, res) => {
    try {
        const techData = { ...req.body };

        // Generate slug
        techData.slug = await generateUniqueSlug(techData.name, Technology);

        // Handle logo upload
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, "portfolio/technologies");
            techData.logo = {
                publicId: result.publicId,
                url: result.url,
            };
        }

        const technology = await Technology.create(techData);

        res.status(201).json({
            success: true,
            message: "Technology created successfully",
            data: technology,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating technology",
            error: error.message,
        });
    }
};

// @desc    Update technology
// @route   PUT /api/admin/technologies/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        let technology = await Technology.findById(req.params.id);

        if (!technology) {
            return res.status(404).json({
                success: false,
                message: "Technology not found",
            });
        }

        const updateData = { ...req.body };

        // Update slug if name changed
        if (updateData.name && updateData.name !== technology.name) {
            updateData.slug = await generateUniqueSlug(updateData.name, Technology, req.params.id);
        }

        // Handle logo update
        if (req.file) {
            // Delete old logo
            if (technology.logo && technology.logo.publicId) {
                await deleteFromCloudinary(technology.logo.publicId);
            }
            // Upload new logo
            const result = await uploadToCloudinary(req.file.buffer, "portfolio/technologies");
            updateData.logo = {
                publicId: result.publicId,
                url: result.url,
            };
        }

        technology = await Technology.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Technology updated successfully",
            data: technology,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating technology",
            error: error.message,
        });
    }
};

// @desc    Delete technology
// @route   DELETE /api/admin/technologies/:id
// @access  Private
exports.delete = async (req, res) => {
    try {
        const technology = await Technology.findById(req.params.id);

        if (!technology) {
            return res.status(404).json({
                success: false,
                message: "Technology not found",
            });
        }

        // Delete logo from Cloudinary
        if (technology.logo && technology.logo.publicId) {
            await deleteFromCloudinary(technology.logo.publicId);
        }

        await Technology.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Technology deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting technology",
            error: error.message,
        });
    }
};

// @desc    Toggle featured status
// @route   PATCH /api/admin/technologies/:id/toggle-featured
// @access  Private
exports.toggleFeatured = async (req, res) => {
    try {
        const technology = await Technology.findById(req.params.id);

        if (!technology) {
            return res.status(404).json({
                success: false,
                message: "Technology not found",
            });
        }

        technology.isFeatured = !technology.isFeatured;
        await technology.save();

        res.status(200).json({
            success: true,
            message: `Technology ${technology.isFeatured ? "featured" : "unfeatured"} successfully`,
            data: technology,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error toggling featured status",
            error: error.message,
        });
    }
};
