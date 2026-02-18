/** @format */

const mongoose = require("mongoose");

const analyticSchema = new mongoose.Schema(
    {
        // Polymorphic relationship
        trackableType: {
            type: String,
            enum: ["Project", "Blog", "User"],
            required: true,
        },
        trackableId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "trackableType",
            required: true,
        },
        eventType: {
            type: String,
            enum: ["view", "like", "share", "click", "download"],
            required: true,
        },
        ipAddress: {
            type: String,
            trim: true,
        },
        userAgent: {
            type: String,
            trim: true,
        },
        refererUrl: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        deviceType: {
            type: String,
            enum: ["desktop", "mobile", "tablet", "unknown"],
            default: "unknown",
        },
        browser: {
            type: String,
            trim: true,
        },
        os: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

// Indexes for analytics queries
analyticSchema.index({ trackableType: 1, trackableId: 1 });
analyticSchema.index({ eventType: 1, createdAt: -1 });
analyticSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Analytic", analyticSchema);
