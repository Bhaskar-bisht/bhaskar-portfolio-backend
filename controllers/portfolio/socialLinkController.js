/** @format */

const SocialLink = require("../../src/models/SocialLink");

// @desc    Get all active social links
// @route   GET /api/portfolio/social-links
// @access  Public
exports.index = async (req, res) => {
    try {
        const socialLinks = await SocialLink.find({ isActive: true })
            .sort({ displayOrder: 1 })
            .select("platform url username icon");

        res.status(200).json({
            success: true,
            data: socialLinks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching social links",
            error: error.message,
        });
    }
};
