/** @format */

// ==================================================
// ANALYTIC CONTROLLER
// ==================================================
const Analytic = require("../../src/models/Analytic");

exports.analyticController = {
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 100, trackableType, eventType } = req.query;
            let query = {};

            if (trackableType) query.trackableType = trackableType;
            if (eventType) query.eventType = eventType;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const total = await Analytic.countDocuments(query);

            const analytics = await Analytic.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(skip);

            res.status(200).json({
                success: true,
                data: analytics,
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
                message: "Error fetching analytics",
                error: error.message,
            });
        }
    },

    getStats: async (req, res) => {
        try {
            const stats = await Analytic.aggregate([
                {
                    $group: {
                        _id: "$eventType",
                        count: { $sum: 1 },
                    },
                },
            ]);

            const totalViews = await Analytic.countDocuments({ eventType: "view" });
            const totalLikes = await Analytic.countDocuments({ eventType: "like" });

            res.status(200).json({
                success: true,
                data: {
                    totalViews,
                    totalLikes,
                    breakdown: stats,
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching analytics stats",
                error: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            await Analytic.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Analytic deleted successfully" });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting analytic",
                error: error.message,
            });
        }
    },
};
