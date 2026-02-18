/** @format */

const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
        },
        ipAddress: {
            type: String,
            trim: true,
        },
        userAgent: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["new", "read", "replied", "archived"],
            default: "new",
        },
        repliedAt: {
            type: Date,
        },
        replyMessage: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

// Index
contactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
