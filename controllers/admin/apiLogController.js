/** @format */

const ApiLog = require("../../src/models/ApiLog");

// Get all API logs with filters
exports.index = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            method,
            statusCode,
            startDate,
            endDate,
            ipAddress,
            path,
            sort = "-timestamp",
        } = req.query;

        const query = {};

        // Filters
        if (method) query.method = method.toUpperCase();
        if (statusCode) query.statusCode = parseInt(statusCode);
        if (ipAddress) query.ipAddress = ipAddress;
        if (path) query.path = { $regex: path, $options: "i" };

        // Date range filter
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            ApiLog.find(query)
                .sort(sort)
                .limit(parseInt(limit))
                .skip(skip)
                .select("-requestHeaders -responseBody") // Exclude large fields for list view
                .lean(),
            ApiLog.countDocuments(query),
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching API logs",
            error: error.message,
        });
    }
};

// Get single API log with full details
exports.show = async (req, res) => {
    try {
        const log = await ApiLog.findById(req.params.id);

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "API log not found",
            });
        }

        res.json({
            success: true,
            data: log,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching API log",
            error: error.message,
        });
    }
};

// Get API log statistics
exports.getStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.timestamp = {};
            if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
            if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
        }

        const [totalRequests, methodStats, statusStats, topPaths, avgResponseTime, errorRate] = await Promise.all([
            ApiLog.countDocuments(dateFilter),

            ApiLog.aggregate([
                { $match: dateFilter },
                { $group: { _id: "$method", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),

            ApiLog.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: {
                            $concat: [{ $substr: [{ $toString: "$statusCode" }, 0, 1] }, "xx"],
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),

            ApiLog.aggregate([
                { $match: dateFilter },
                { $group: { _id: "$path", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),

            ApiLog.aggregate([{ $match: dateFilter }, { $group: { _id: null, avgTime: { $avg: "$responseTime" } } }]),

            ApiLog.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        errors: {
                            $sum: {
                                $cond: [{ $gte: ["$statusCode", 400] }, 1, 0],
                            },
                        },
                    },
                },
            ]),
        ]);

        res.json({
            success: true,
            data: {
                totalRequests,
                methodBreakdown: methodStats,
                statusBreakdown: statusStats,
                topEndpoints: topPaths,
                averageResponseTime: avgResponseTime[0]?.avgTime || 0,
                errorRate: errorRate[0] ? ((errorRate[0].errors / errorRate[0].total) * 100).toFixed(2) : 0,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching API log statistics",
            error: error.message,
        });
    }
};

// Delete logs by date range
exports.deleteByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required",
            });
        }

        const query = {
            timestamp: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        };

        const result = await ApiLog.deleteMany(query);

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} API logs`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting API logs",
            error: error.message,
        });
    }
};

// Delete logs by method
exports.deleteByMethod = async (req, res) => {
    try {
        const { method } = req.body;

        if (!method) {
            return res.status(400).json({
                success: false,
                message: "Method is required",
            });
        }

        const result = await ApiLog.deleteMany({ method: method.toUpperCase() });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} ${method} API logs`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting API logs",
            error: error.message,
        });
    }
};

// Delete all logs
exports.deleteAll = async (req, res) => {
    try {
        const result = await ApiLog.deleteMany({});

        res.json({
            success: true,
            message: `Deleted all ${result.deletedCount} API logs`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting API logs",
            error: error.message,
        });
    }
};

// Delete single log
exports.destroy = async (req, res) => {
    try {
        const log = await ApiLog.findByIdAndDelete(req.params.id);

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "API log not found",
            });
        }

        res.json({
            success: true,
            message: "API log deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting API log",
            error: error.message,
        });
    }
};
