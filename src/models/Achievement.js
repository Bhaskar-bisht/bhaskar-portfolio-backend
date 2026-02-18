/** @format */

const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Achievement title is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        awardedBy: {
            type: String,
            trim: true,
        },
        awardDate: {
            type: Date,
        },
        awardUrl: {
            type: String,
            trim: true,
        },
        achievementType: {
            type: String,
            enum: ["award", "recognition", "competition", "publication", "other"],
            default: "award",
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        // Certificate - Cloudinary
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
achievementSchema.index({ userId: 1, displayOrder: 1 });

module.exports = mongoose.model("Achievement", achievementSchema);
