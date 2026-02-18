/** @format */

const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        technologyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Technology",
            required: [true, "Technology is required"],
        },
        proficiencyPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 50,
        },
        yearsOfExperience: {
            type: Number,
            min: 0,
            default: 0,
        },
        isPrimarySkill: {
            type: Boolean,
            default: false,
        },
        lastUsedAt: {
            type: Date,
        },
        certificationUrl: {
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

// Ensure unique skill per user
skillSchema.index({ userId: 1, technologyId: 1 }, { unique: true });
skillSchema.index({ userId: 1, displayOrder: 1 });

module.exports = mongoose.model("Skill", skillSchema);
