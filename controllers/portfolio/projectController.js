/** @format */

const Project = require("../../src/models/Project");
const Category = require("../../src/models/Category");
const ProjectFeature = require("../../src/models/ProjectFeature");

// @desc    Get all projects with filters
// @route   GET /api/portfolio/projects
// @access  Public
exports.index = async (req, res) => {
    try {
        const { status, type, category, search, page = 1, per_page = 12 } = req.query;

        // Build query
        let query = { isPublished: true };

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by type
        if (type) {
            query.projectType = type;
        }

        // Filter by category
        if (category) {
            const cat = await Category.findOne({ slug: category });
            if (cat) {
                query.categories = cat._id;
            }
        }

        // Search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { shortDescription: { $regex: search, $options: "i" } },
                { fullDescription: { $regex: search, $options: "i" } },
            ];
        }

        // Pagination
        const limit = parseInt(per_page);
        const skip = (parseInt(page) - 1) * limit;
        const total = await Project.countDocuments(query);

        // Get projects
        const projects = await Project.find(query)
            .populate("categories", "name slug colorCode")
            .populate("technologies.technology", "name slug logo colorCode")
            .sort({ priority: -1, createdAt: -1 })
            .limit(limit)
            .skip(skip);

        res.status(200).json({
            success: true,
            data: projects,
            meta: {
                current_page: parseInt(page),
                per_page: limit,
                total: total,
                last_page: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching projects",
            error: error.message,
        });
    }
};

// @desc    Get featured projects
// @route   GET /api/portfolio/projects/featured
// @access  Public
exports.getFeatured = async (req, res) => {
    try {
        const projects = await Project.find({ isPublished: true, featured: true })
            .populate("categories", "name slug")
            .populate("technologies.technology", "name slug")
            .sort({ priority: -1 })
            .limit(6);

        res.status(200).json({
            success: true,
            data: projects,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching featured projects",
            error: error.message,
        });
    }
};

// @desc    Get single project by slug
// @route   GET /api/portfolio/projects/:slug
// @access  Public
exports.show = async (req, res) => {
    try {
        const project = await Project.findOne({
            slug: req.params.slug,
            isPublished: true,
        })
            .populate("categories")
            .populate("technologies.technology")
            .populate({
                path: "features",
            });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // Increment views
        project.viewsCount += 1;
        await project.save();

        // Get testimonials for this project
        const Testimonial = require("../../models/Testimonial");
        const testimonials = await Testimonial.find({
            testimoniableType: "Project",
            testimoniableId: project._id,
            isApproved: true,
        }).sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            data: {
                ...project.toObject(),
                testimonials,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching project",
            error: error.message,
        });
    }
};

// @desc    Get related projects
// @route   GET /api/portfolio/projects/:slug/related
// @access  Public
exports.getRelated = async (req, res) => {
    try {
        const project = await Project.findOne({ slug: req.params.slug }).populate("categories");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const categoryIds = project.categories.map((cat) => cat._id);

        const relatedProjects = await Project.find({
            _id: { $ne: project._id },
            isPublished: true,
            categories: { $in: categoryIds },
        })
            .populate("categories", "name slug")
            .sort({ createdAt: -1 })
            .limit(4);

        res.status(200).json({
            success: true,
            data: relatedProjects,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching related projects",
            error: error.message,
        });
    }
};

// @desc    Get all categories
// @route   GET /api/portfolio/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({
            displayOrder: 1,
        });

        // Get project count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const projectCount = await Project.countDocuments({
                    categories: category._id,
                    isPublished: true,
                });
                return {
                    ...category.toObject(),
                    projectsCount: projectCount,
                };
            }),
        );

        res.status(200).json({
            success: true,
            data: categoriesWithCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message,
        });
    }
};

// @desc    Get projects by category
// @route   GET /api/portfolio/categories/:slug
// @access  Public
exports.getProjectsByCategory = async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const { page = 1, per_page = 12 } = req.query;
        const limit = parseInt(per_page);
        const skip = (parseInt(page) - 1) * limit;

        const query = {
            categories: category._id,
            isPublished: true,
        };

        const total = await Project.countDocuments(query);

        const projects = await Project.find(query)
            .populate("categories", "name slug")
            .populate("technologies.technology", "name slug")
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        res.status(200).json({
            success: true,
            category: {
                name: category.name,
                description: category.description,
            },
            data: projects,
            meta: {
                current_page: parseInt(page),
                last_page: Math.ceil(total / limit),
                total: total,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching projects by category",
            error: error.message,
        });
    }
};
