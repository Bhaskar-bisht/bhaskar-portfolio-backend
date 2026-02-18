/** @format */

// const User = require("../../models/User");
const User = require("../../src/models/User");
const Skill = require("../../src/models/Skill");
const Education = require("../../src/models/Education");
const Experience = require("../../src/models/Experience");
const Certification = require("../../src/models/Certification");
const Achievement = require("../../src/models/Achievement");
const SocialLink = require("../../src/models/SocialLink");
const Technology = require("../../src/models/Technology");
const Testimonial = require("../../src/models/Testimonial");
const Project = require("../../src/models/Project");
const Blog = require("../../src/models/Blog");

// @desc    Get complete profile with all details
// @route   GET /api/portfolio/profile
// @access  Public
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findOne()
            .select("-password")
            .populate({
                path: "skills",
                populate: {
                    path: "technologyId",
                    select: "name slug logo colorCode",
                },
            })
            .populate("educations")
            .populate({
                path: "experiences",
                populate: {
                    path: "technologies",
                    select: "name slug logo colorCode",
                },
            })
            .populate("certifications")
            .populate("achievements")
            .populate("socialLinks");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching profile",
            error: error.message,
        });
    }
};

// @desc    Get skills with proficiency
// @route   GET /api/portfolio/profile/skills
// @access  Public
exports.getSkills = async (req, res) => {
    try {
        const skills = await Skill.find()
            .populate("technologyId", "name slug logo colorCode category")
            .sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: skills,
            count: skills.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching skills",
            error: error.message,
        });
    }
};

// @desc    Get education history
// @route   GET /api/portfolio/profile/education
// @access  Public
exports.getEducation = async (req, res) => {
    try {
        const education = await Education.find().sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: education,
            count: education.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching education",
            error: error.message,
        });
    }
};

// @desc    Get work experience
// @route   GET /api/portfolio/profile/experience
// @access  Public
exports.getExperience = async (req, res) => {
    try {
        const experiences = await Experience.find()
            .populate("technologies", "name slug logo colorCode")
            .sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: experiences,
            count: experiences.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching experience",
            error: error.message,
        });
    }
};

// @desc    Get certifications
// @route   GET /api/portfolio/profile/certifications
// @access  Public
exports.getCertifications = async (req, res) => {
    try {
        const certifications = await Certification.find().sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: certifications,
            count: certifications.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching certifications",
            error: error.message,
        });
    }
};

// @desc    Get achievements
// @route   GET /api/portfolio/profile/achievements
// @access  Public
exports.getAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find().sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: achievements,
            count: achievements.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching achievements",
            error: error.message,
        });
    }
};

// @desc    Get social links
// @route   GET /api/portfolio/profile/social-links
// @access  Public
exports.getSocialLinks = async (req, res) => {
    try {
        const socialLinks = await SocialLink.find({ isActive: true }).sort({
            displayOrder: 1,
        });

        res.status(200).json({
            success: true,
            data: socialLinks,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching social links",
            error: error.message,
        });
    }
};

// @desc    Get portfolio statistics
// @route   GET /api/portfolio/profile/stats
// @access  Public
exports.getStats = async (req, res) => {
    try {
        const stats = {
            totalProjects: await Project.countDocuments({ isPublished: true }),
            completedProjects: await Project.countDocuments({
                isPublished: true,
                status: "completed",
            }),
            totalBlogs: await Blog.countDocuments({ status: "published" }),
            yearsOfExperience: 0,
            totalSkills: await Skill.countDocuments(),
            certifications: await Certification.countDocuments(),
        };

        // Calculate years of experience from user profile
        const user = await User.findOne().select("yearsOfExperience");
        if (user) {
            stats.yearsOfExperience = user.yearsOfExperience || 0;
        }

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching stats",
            error: error.message,
        });
    }
};

// @desc    Get all technologies
// @route   GET /api/portfolio/technologies
// @access  Public
exports.getTechnologies = async (req, res) => {
    try {
        const technologies = await Technology.find().sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: technologies,
            count: technologies.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching technologies",
            error: error.message,
        });
    }
};

// @desc    Get featured technologies
// @route   GET /api/portfolio/technologies/featured
// @access  Public
exports.getFeaturedTechnologies = async (req, res) => {
    try {
        const technologies = await Technology.find({ isFeatured: true }).sort({
            displayOrder: 1,
        });

        res.status(200).json({
            success: true,
            data: technologies,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching featured technologies",
            error: error.message,
        });
    }
};

// @desc    Get testimonials
// @route   GET /api/portfolio/testimonials
// @access  Public
exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isApproved: true }).sort({
            displayOrder: 1,
        });

        res.status(200).json({
            success: true,
            data: testimonials,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching testimonials",
            error: error.message,
        });
    }
};

// @desc    Get featured testimonials
// @route   GET /api/portfolio/testimonials/featured
// @access  Public
exports.getFeaturedTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({
            isApproved: true,
            isFeatured: true,
        }).sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: testimonials,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching featured testimonials",
            error: error.message,
        });
    }
};

// @desc    Global search
// @route   GET /api/portfolio/search?q=query
// @access  Public
exports.search = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        const searchRegex = new RegExp(q, "i");

        // Search in projects
        const projects = await Project.find({
            isPublished: true,
            $or: [{ title: searchRegex }, { shortDescription: searchRegex }, { fullDescription: searchRegex }],
        })
            .select("title slug shortDescription thumbnail")
            .limit(5);

        // Search in blogs
        const blogs = await Blog.find({
            status: "published",
            $or: [{ title: searchRegex }, { excerpt: searchRegex }, { body: searchRegex }],
        })
            .select("title slug excerpt featuredImage publishedAt")
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                projects,
                blogs,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error performing search",
            error: error.message,
        });
    }
};

// @desc    Get overview statistics
// @route   GET /api/portfolio/stats/overview
// @access  Public
exports.getOverviewStats = async (req, res) => {
    try {
        const stats = {
            projects: await Project.countDocuments({ isPublished: true }),
            blogs: await Blog.countDocuments({ status: "published" }),
            skills: await Skill.countDocuments(),
            experience: await Experience.countDocuments(),
        };

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching overview stats",
            error: error.message,
        });
    }
};
