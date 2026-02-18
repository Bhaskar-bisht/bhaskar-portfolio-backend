/** @format */

const mongoose = require("mongoose");

const seoMetadataSchema = new mongoose.Schema(
    {
        // Polymorphic relationship
        seoableType: {
            type: String,
            enum: ["Project", "Blog", "User", "Service"],
            required: true,
        },
        seoableId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "seoableType",
            required: true,
        },
        title: {
            type: String,
            trim: true,
            maxlength: 60,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 160,
        },
        keywords: {
            type: String,
            trim: true,
        },
        ogTitle: {
            type: String,
            trim: true,
        },
        ogDescription: {
            type: String,
            trim: true,
        },
        twitterCard: {
            type: String,
            enum: ["summary", "summary_large_image", "app", "player"],
            default: "summary_large_image",
        },
        twitterTitle: {
            type: String,
            trim: true,
        },
        canonicalUrl: {
            type: String,
            trim: true,
        },
        robots: {
            type: String,
            enum: ["index,follow", "noindex,follow", "index,nofollow", "noindex,nofollow"],
            default: "index,follow",
        },
        schemaMarkup: {
            type: mongoose.Schema.Types.Mixed,
        },
        // OG Image - Cloudinary
        ogImage: {
            publicId: String,
            url: String,
        },
    },
    {
        timestamps: true,
    },
);

// Index
seoMetadataSchema.index({ seoableType: 1, seoableId: 1 }, { unique: true });

module.exports = mongoose.model("SeoMetadata", seoMetadataSchema);
