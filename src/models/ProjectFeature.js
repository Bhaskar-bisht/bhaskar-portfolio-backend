/** @format */

const mongoose = require("mongoose");

const projectFeatureSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Feature title is required"],
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
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
);

// Index for better query performance
projectFeatureSchema.index({ projectId: 1, displayOrder: 1 });

module.exports = mongoose.model("ProjectFeature", projectFeatureSchema);
