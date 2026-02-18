/** @format */

const mongoose = require("mongoose");

const technologySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Technology name is required"],
            trim: true,
            unique: true,
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
        category: {
            type: String,
            enum: ["frontend", "backend", "database", "devops", "mobile", "design", "other"],
            default: "other",
        },
        proficiencyLevel: {
            type: String,
            enum: ["beginner", "intermediate", "advanced", "expert"],
        },
        yearsOfExperience: {
            type: Number,
            min: 0,
        },
        colorCode: {
            type: String,
            trim: true,
        },
        backgroundColor: {
            type: String,
            trim: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        documentationUrl: {
            type: String,
            trim: true,
        },
        officialUrl: {
            type: String,
            trim: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        // Cloudinary logo
        logo: {
            publicId: String,
            url: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Auto-generate slug before saving
technologySchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

// Virtual for projects using this technology
technologySchema.virtual("projects", {
    ref: "Project",
    localField: "_id",
    foreignField: "technologies.technology",
});

module.exports = mongoose.model("Technology", technologySchema);
