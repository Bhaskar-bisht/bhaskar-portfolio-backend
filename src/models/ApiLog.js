/** @format */

const mongoose = require("mongoose");

const apiLogSchema = new mongoose.Schema(
    {
        method: {
            type: String,
            required: true,
            enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
        },
        path: {
            type: String,
            required: true,
        },
        fullUrl: {
            type: String,
            required: true,
        },
        statusCode: {
            type: Number,
            required: true,
        },
        responseTime: {
            type: Number, // milliseconds
            required: true,
        },
        ipAddress: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
        },
        origin: {
            type: String,
        },
        referer: {
            type: String,
        },
        requestHeaders: {
            type: Object,
        },
        requestBody: {
            type: Object,
        },
        requestQuery: {
            type: Object,
        },
        responseBody: {
            type: Object,
        },
        errorMessage: {
            type: String,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

// Indexes for faster queries
apiLogSchema.index({ timestamp: -1 });
apiLogSchema.index({ method: 1 });
apiLogSchema.index({ statusCode: 1 });
apiLogSchema.index({ path: 1 });

module.exports = mongoose.model("ApiLog", apiLogSchema);
