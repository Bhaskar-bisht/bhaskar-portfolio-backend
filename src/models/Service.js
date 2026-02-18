/** @format */

const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Service title is required"],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
            trim: true,
        },
        pricingType: {
            type: String,
            enum: ["fixed", "hourly", "project_based", "custom"],
            default: "project_based",
        },
        startingPrice: {
            type: Number,
            min: 0,
        },
        features: [
            {
                type: String,
                trim: true,
            },
        ],
        deliveryTime: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        // Thumbnail - Cloudinary
        thumbnail: {
            publicId: String,
            url: String,
        },
    },
    {
        timestamps: true,
    },
);

// Auto-generate slug
serviceSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

module.exports = mongoose.model("Service", serviceSchema);
