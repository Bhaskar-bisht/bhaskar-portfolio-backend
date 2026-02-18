/** @format */

const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        companyName: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
        },
        position: {
            type: String,
            required: [true, "Position is required"],
            trim: true,
        },
        employmentType: {
            type: String,
            enum: ["full_time", "part_time", "contract", "freelance", "internship"],
            default: "full_time",
        },
        location: {
            type: String,
            trim: true,
        },
        isRemote: {
            type: Boolean,
            default: false,
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
        achievements: [
            {
                type: String,
                trim: true,
            },
        ],
        companyUrl: {
            type: String,
            trim: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        // Company logo - Cloudinary
        companyLogo: {
            publicId: String,
            url: String,
        },
        // Technologies used
        technologies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Technology",
            },
        ],
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// Soft delete middleware
experienceSchema.pre(/^find/, function (next) {
    this.where({ deletedAt: null });
    next();
});

// Index
experienceSchema.index({ userId: 1, displayOrder: 1 });

module.exports = mongoose.model("Experience", experienceSchema);
