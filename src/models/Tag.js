/** @format */

const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tag name is required"],
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        colorCode: {
            type: String,
            trim: true,
            default: "#3B82F6",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

// Auto-generate slug
tagSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    next();
});

// Virtual for blogs count
tagSchema.virtual("blogsCount", {
    ref: "Blog",
    localField: "_id",
    foreignField: "tags",
    count: true,
});

module.exports = mongoose.model("Tag", tagSchema);
