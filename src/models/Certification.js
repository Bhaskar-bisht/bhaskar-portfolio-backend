/** @format */

const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Certification title is required"],
            trim: true,
        },
        issuingOrganization: {
            type: String,
            required: [true, "Issuing organization is required"],
            trim: true,
        },
        credentialId: {
            type: String,
            trim: true,
        },
        credentialUrl: {
            type: String,
            trim: true,
        },
        issueDate: {
            type: Date,
            required: [true, "Issue date is required"],
        },
        expiryDate: {
            type: Date,
        },
        doesNotExpire: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            trim: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        // Certificate file - Cloudinary
        certificate: {
            publicId: String,
            url: String,
        },
    },
    {
        timestamps: true,
    },
);

// Index
certificationSchema.index({ userId: 1, displayOrder: 1 });

module.exports = mongoose.model("Certification", certificationSchema);
