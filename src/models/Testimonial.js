/** @format */

const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
    {
        testimonialType: {
            type: String,
            enum: ["general", "project", "service"],
            default: "general",
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        position: {
            type: String,
            trim: true,
        },
        company: {
            type: String,
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Testimonial content is required"],
            trim: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5,
        },
        linkedinUrl: {
            type: String,
            trim: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        // Polymorphic relationship fields
        testimoniableType: {
            type: String,
            enum: ["Project", "Service", "User", null],
            default: null,
        },
        testimoniableId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "testimoniableType",
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        // Avatar - Cloudinary
        avatar: {
            publicId: String,
            url: String,
        },
        // Company logo - Cloudinary
        companyLogo: {
            publicId: String,
            url: String,
        },
    },
    {
        timestamps: true,
    },
);

// Index
testimonialSchema.index({ testimoniableType: 1, testimoniableId: 1 });
testimonialSchema.index({ isApproved: 1, isFeatured: 1 });

module.exports = mongoose.model("Testimonial", testimonialSchema);
