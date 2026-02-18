/** @format */

const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        institutionName: {
            type: String,
            required: [true, "Institution name is required"],
            trim: true,
        },
        degree: {
            type: String,
            required: [true, "Degree is required"],
            trim: true,
        },
        fieldOfStudy: {
            type: String,
            trim: true,
        },
        grade: {
            type: String,
            trim: true,
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"],
        },
        endDate: {
            type: Date,
        },
        isCurrent: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            trim: true,
        },
        achievements: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        certificateUrl: {
            type: String,
            trim: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        // Institution logo - Cloudinary
        institutionLogo: {
            publicId: String,
            url: String,
        },
        // Certificate file - Cloudinary
        certificate: {
            publicId: String,
            url: String,
        },
    },
    {
        timestamps: true,
    },
);

// Index
educationSchema.index({ userId: 1, displayOrder: 1 });

module.exports = mongoose.model("Education", educationSchema);
