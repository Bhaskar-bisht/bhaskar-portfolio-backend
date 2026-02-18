/** @format */

const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Project title is required"],
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        shortDescription: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        fullDescription: {
            type: String,
            trim: true,
        },
        projectType: {
            type: String,
            enum: ["web", "mobile", "desktop", "api", "other"],
            default: "web",
        },
        status: {
            type: String,
            enum: ["planning", "in_progress", "completed", "on_hold", "cancelled"],
            default: "completed",
        },
        featured: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: Number,
            default: 0,
        },
        clientName: {
            type: String,
            trim: true,
        },
        clientFeedback: {
            type: String,
            trim: true,
        },
        projectUrl: {
            type: String,
            trim: true,
        },
        githubUrl: {
            type: String,
            trim: true,
        },
        demoUrl: {
            type: String,
            trim: true,
        },
        startedAt: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
        budgetRange: {
            type: String,
            trim: true,
        },
        teamSize: {
            type: Number,
            min: 1,
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        likesCount: {
            type: Number,
            default: 0,
        },
        isPublished: {
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
        // Images - Cloudinary URLs
        thumbnail: {
            publicId: String,
            url: String,
        },
        banner: {
            publicId: String,
            url: String,
        },
        gallery: [
            {
                publicId: String,
                url: String,
                name: String,
            },
        ],
        // Categories (many-to-many)
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        // Technologies with pivot data
        technologies: [
            {
                technology: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Technology",
                },
                usagePercentage: {
                    type: Number,
                    min: 0,
                    max: 100,
                },
                role: {
                    type: String,
                    trim: true,
                },
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
projectSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

// Virtual for features
projectSchema.virtual("features", {
    ref: "ProjectFeature",
    localField: "_id",
    foreignField: "projectId",
});

// Virtual for testimonials
projectSchema.virtual("testimonials", {
    ref: "Testimonial",
    localField: "_id",
    foreignField: "testimoniableId",
    match: { testimoniableType: "Project" },
});

// Soft delete middleware
projectSchema.pre(/^find/, function (next) {
    this.where({ deletedAt: null });
    next();
});

// Indexes for better performance
// projectSchema.index({ slug: 1 });
projectSchema.index({ isPublished: 1, featured: 1 });
projectSchema.index({ userId: 1 });

module.exports = mongoose.model("Project", projectSchema);
