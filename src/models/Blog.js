/** @format */

const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Blog title is required"],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        excerpt: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        body: {
            type: String,
            required: [true, "Blog body is required"],
        },
        readingTime: {
            type: Number, // in minutes
            default: 5,
        },
        status: {
            type: String,
            enum: ["draft", "published", "scheduled", "archived"],
            default: "draft",
        },
        publishedAt: {
            type: Date,
        },
        scheduledAt: {
            type: Date,
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        likesCount: {
            type: Number,
            default: 0,
        },
        sharesCount: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        metaTitle: {
            type: String,
            trim: true,
        },
        metaDescription: {
            type: String,
            trim: true,
        },
        metaKeywords: {
            type: String,
            trim: true,
        },
        // Featured image - Cloudinary
        featuredImage: {
            publicId: String,
            url: String,
        },
        // Tags (many-to-many)
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag",
            },
        ],
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Auto-generate slug
blogSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

// Auto-set publishedAt when status changes to published
blogSchema.pre("save", function (next) {
    if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

// Soft delete middleware
blogSchema.pre(/^find/, function (next) {
    this.where({ deletedAt: null });
    next();
});

// Indexes
// blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ userId: 1 });

module.exports = mongoose.model("Blog", blogSchema);
