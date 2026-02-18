/** @format */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false,
        },
        bio: {
            type: String,
            trim: true,
        },
        tagline: {
            type: String,
            trim: true,
        },
        currentPosition: {
            type: String,
            trim: true,
        },
        yearsOfExperience: {
            type: Number,
            min: 0,
        },
        location: {
            type: String,
            trim: true,
        },
        timezone: {
            type: String,
            trim: true,
        },
        availabilityStatus: {
            type: String,
            enum: ["available", "busy", "not_available"],
            default: "available",
        },
        githubUrl: {
            type: String,
            trim: true,
        },
        linkedinUrl: {
            type: String,
            trim: true,
        },
        twitterUrl: {
            type: String,
            trim: true,
        },
        behanceUrl: {
            type: String,
            trim: true,
        },
        dribbbleUrl: {
            type: String,
            trim: true,
        },
        // Cloudinary URLs
        avatar: {
            publicId: String,
            url: String,
        },
        resume: {
            publicId: String,
            url: String,
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "admin",
        },
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

// Virtual populate for relations
userSchema.virtual("projects", {
    ref: "Project",
    localField: "_id",
    foreignField: "userId",
});

userSchema.virtual("blogs", {
    ref: "Blog",
    localField: "_id",
    foreignField: "userId",
});

userSchema.virtual("experiences", {
    ref: "Experience",
    localField: "_id",
    foreignField: "userId",
});

userSchema.virtual("educations", {
    ref: "Education",
    localField: "_id",
    foreignField: "userId",
});

userSchema.virtual("skills", {
    ref: "Skill",
    localField: "_id",
    foreignField: "userId",
});

userSchema.virtual("certifications", {
    ref: "Certification",
    localField: "_id",
    foreignField: "userId",
});

userSchema.virtual("achievements", {
    ref: "Achievement",
    localField: "_id",
    foreignField: "userId",
});

userSchema.virtual("socialLinks", {
    ref: "SocialLink",
    localField: "_id",
    foreignField: "userId",
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Soft delete query middleware
userSchema.pre(/^find/, function (next) {
    this.where({ deletedAt: null });
    next();
});

module.exports = mongoose.model("User", userSchema);
