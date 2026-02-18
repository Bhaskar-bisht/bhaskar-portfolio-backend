/** @format */

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
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
        icon: {
            type: String,
            trim: true,
        },
        colorCode: {
            type: String,
            trim: true,
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        // Cloudinary icon image
        iconImage: {
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

// Auto-generate slug
categorySchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

// Virtual for subcategories
categorySchema.virtual("children", {
    ref: "Category",
    localField: "_id",
    foreignField: "parentId",
});

// Virtual for projects
categorySchema.virtual("projects", {
    ref: "Project",
    localField: "_id",
    foreignField: "categories",
});

module.exports = mongoose.model("Category", categorySchema);
