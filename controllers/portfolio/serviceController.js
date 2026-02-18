/** @format */

const Service = require("../../src/models/Service");

// @desc    Get all active services
// @route   GET /api/portfolio/services
// @access  Public
exports.index = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true }).sort({
            displayOrder: 1,
        });

        res.status(200).json({
            success: true,
            data: services,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching services",
            error: error.message,
        });
    }
};

// @desc    Get featured services
// @route   GET /api/portfolio/services/featured
// @access  Public
exports.getFeatured = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true, isFeatured: true }).sort({ displayOrder: 1 }).limit(3);

        res.status(200).json({
            success: true,
            data: services,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching featured services",
            error: error.message,
        });
    }
};

// @desc    Get single service by slug
// @route   GET /api/portfolio/services/:slug
// @access  Public
exports.show = async (req, res) => {
    try {
        const service = await Service.findOne({
            slug: req.params.slug,
            isActive: true,
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        res.status(200).json({
            success: true,
            data: service,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching service",
            error: error.message,
        });
    }
};
