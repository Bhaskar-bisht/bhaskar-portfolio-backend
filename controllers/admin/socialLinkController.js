/** @format */

// ==================================================
// SOCIAL LINK CONTROLLER
// ==================================================
const SocialLink = require("../../src/models/SocialLink");

exports.socialLinkController = {
    getAll: async (req, res) => {
        try {
            const { userId } = req.query;
            let query = {};

            if (userId) query.userId = userId;

            const socialLinks = await SocialLink.find(query).populate("userId", "name email").sort({ displayOrder: 1 });

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
    },

    getById: async (req, res) => {
        try {
            const socialLink = await SocialLink.findById(req.params.id).populate("userId", "name email");
            if (!socialLink) {
                return res.status(404).json({ success: false, message: "Social link not found" });
            }
            res.status(200).json({ success: true, data: socialLink });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching social link",
                error: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const socialLinkData = { ...req.body };
            if (!socialLinkData.userId) socialLinkData.userId = req.user._id;

            const socialLink = await SocialLink.create(socialLinkData);
            await socialLink.populate("userId", "name email");

            res.status(201).json({
                success: true,
                message: "Social link created successfully",
                data: socialLink,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating social link",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            let socialLink = await SocialLink.findById(req.params.id);
            if (!socialLink) {
                return res.status(404).json({ success: false, message: "Social link not found" });
            }

            socialLink = await SocialLink.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            }).populate("userId", "name email");

            res.status(200).json({
                success: true,
                message: "Social link updated successfully",
                data: socialLink,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating social link",
                error: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const socialLink = await SocialLink.findById(req.params.id);
            if (!socialLink) {
                return res.status(404).json({ success: false, message: "Social link not found" });
            }

            await SocialLink.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Social link deleted successfully" });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting social link",
                error: error.message,
            });
        }
    },
};
