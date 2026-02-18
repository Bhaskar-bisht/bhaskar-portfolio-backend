/** @format */

// ==================================================
// ACHIEVEMENT CONTROLLER
// ==================================================
const Achievement = require("../../src/models/Achievement");

exports.achievementController = {
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 20, userId, featured } = req.query;
            let query = {};
            if (userId) query.userId = userId;
            if (featured !== undefined) query.isFeatured = featured === "true";

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const total = await Achievement.countDocuments(query);

            const achievements = await Achievement.find(query)
                .populate("userId", "name email")
                .sort({ awardDate: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            res.status(200).json({
                success: true,
                data: achievements,
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
                message: "Error fetching achievements",
                error: error.message,
            });
        }
    },

    getById: async (req, res) => {
        try {
            const achievement = await Achievement.findById(req.params.id).populate("userId", "name email");
            if (!achievement) {
                return res.status(404).json({ success: false, message: "Achievement not found" });
            }
            res.status(200).json({ success: true, data: achievement });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching achievement",
                error: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const achievementData = { ...req.body };
            if (!achievementData.userId) achievementData.userId = req.user._id;

            if (req.file) {
                const result = await uploadToCloudinary(req.file.buffer, "portfolio/achievements");
                achievementData.certificate = {
                    publicId: result.publicId,
                    url: result.url,
                };
            }

            const achievement = await Achievement.create(achievementData);
            await achievement.populate("userId", "name email");

            res.status(201).json({
                success: true,
                message: "Achievement created successfully",
                data: achievement,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating achievement",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            let achievement = await Achievement.findById(req.params.id);
            if (!achievement) {
                return res.status(404).json({ success: false, message: "Achievement not found" });
            }

            const updateData = { ...req.body };

            if (req.file) {
                if (achievement.certificate?.publicId) {
                    await deleteFromCloudinary(achievement.certificate.publicId);
                }
                const result = await uploadToCloudinary(req.file.buffer, "portfolio/achievements");
                updateData.certificate = { publicId: result.publicId, url: result.url };
            }

            achievement = await Achievement.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            }).populate("userId", "name email");

            res.status(200).json({
                success: true,
                message: "Achievement updated successfully",
                data: achievement,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating achievement",
                error: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const achievement = await Achievement.findById(req.params.id);
            if (!achievement) {
                return res.status(404).json({ success: false, message: "Achievement not found" });
            }

            if (achievement.certificate?.publicId) {
                await deleteFromCloudinary(achievement.certificate.publicId);
            }

            await Achievement.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Achievement deleted successfully" });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting achievement",
                error: error.message,
            });
        }
    },

    toggleFeatured: async (req, res) => {
        try {
            const achievement = await Achievement.findById(req.params.id);
            if (!achievement) {
                return res.status(404).json({ success: false, message: "Achievement not found" });
            }

            achievement.isFeatured = !achievement.isFeatured;
            await achievement.save();

            res.status(200).json({
                success: true,
                message: `Achievement ${achievement.isFeatured ? "featured" : "unfeatured"} successfully`,
                data: achievement,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error toggling featured status",
                error: error.message,
            });
        }
    },
};
