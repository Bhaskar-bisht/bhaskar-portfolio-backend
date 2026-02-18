/** @format */

const mongoose = require("mongoose");

const socialLinkSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        platform: {
            type: String,
            required: [true, "Platform is required"],
            enum: [
                "github",
                "linkedin",
                "twitter",
                "facebook",
                "instagram",
                "youtube",
                "behance",
                "dribbble",
                "medium",
                "dev",
                "stackoverflow",
                "codepen",
                "other",
            ],
            trim: true,
        },
        url: {
            type: String,
            required: [true, "URL is required"],
            trim: true,
        },
        username: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
            trim: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

// Index
socialLinkSchema.index({ userId: 1, displayOrder: 1 });

module.exports = mongoose.model("SocialLink", socialLinkSchema);
