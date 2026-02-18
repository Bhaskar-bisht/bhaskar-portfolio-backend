/** @format */

const Project = require("../../src/models/Project");
const {
    uploadToCloudinary,
    deleteFromCloudinary,
    uploadMultipleToCloudinary,
    deleteMultipleFromCloudinary,
} = require("../../utils/cloudinaryUpload");
const { generateUniqueSlug } = require("../../utils/slugify");

// @desc    Get all projects (Admin)
// @route   GET /api/admin/projects
// @access  Private
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, featured } = req.query;

        // Build query
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { shortDescription: { $regex: search, $options: "i" } },
            ];
        }

        if (status) {
            query.status = status;
        }

        if (featured !== undefined) {
            query.featured = featured === "true";
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Project.countDocuments(query);

        const projects = await Project.find(query)
            .populate("categories", "name slug")
            .populate("technologies.technology", "name slug")
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        res.status(200).json({
            success: true,
            data: projects,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
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

// @desc    Get single project by ID
// @route   GET /api/admin/projects/:id
// @access  Private
exports.getById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("categories")
            .populate("technologies.technology")
            .populate("userId");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        res.status(200).json({
            success: true,
            data: project,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching project",
            error: error.message,
        });
    }
};

// @desc    Create new project
// @route   POST /api/admin/projects
// @access  Private
exports.create = async (req, res) => {
    try {
        const projectData = { ...req.body, userId: req.user._id };

        // Generate unique slug
        projectData.slug = await generateUniqueSlug(projectData.title, Project);

        // Handle thumbnail upload
        if (req.files && req.files.thumbnail) {
            const thumbnailResult = await uploadToCloudinary(
                req.files.thumbnail[0].buffer,
                "portfolio/projects/thumbnails",
            );
            projectData.thumbnail = {
                publicId: thumbnailResult.publicId,
                url: thumbnailResult.url,
            };
        }

        // Handle banner upload
        if (req.files && req.files.banner) {
            const bannerResult = await uploadToCloudinary(req.files.banner[0].buffer, "portfolio/projects/banners");
            projectData.banner = {
                publicId: bannerResult.publicId,
                url: bannerResult.url,
            };
        }

        // Handle gallery upload (multiple images)
        if (req.files && req.files.gallery) {
            const galleryResults = await uploadMultipleToCloudinary(req.files.gallery, "portfolio/projects/gallery");
            projectData.gallery = galleryResults.map((result) => ({
                publicId: result.publicId,
                url: result.url,
                name: result.publicId.split("/").pop(),
            }));
        }

        // Parse technologies if it's a string
        if (typeof projectData.technologies === "string") {
            projectData.technologies = JSON.parse(projectData.technologies);
        }

        // Parse categories if it's a string
        if (typeof projectData.categories === "string") {
            projectData.categories = JSON.parse(projectData.categories);
        }

        const project = await Project.create(projectData);

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating project",
            error: error.message,
        });
    }
};

// @desc    Update project
// @route   PUT /api/admin/projects/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const updateData = { ...req.body };

        // Update slug if title changed
        if (updateData.title && updateData.title !== project.title) {
            updateData.slug = await generateUniqueSlug(updateData.title, Project, req.params.id);
        }

        // Handle thumbnail update
        if (req.files && req.files.thumbnail) {
            // Delete old thumbnail
            if (project.thumbnail && project.thumbnail.publicId) {
                await deleteFromCloudinary(project.thumbnail.publicId);
            }
            // Upload new thumbnail
            const thumbnailResult = await uploadToCloudinary(
                req.files.thumbnail[0].buffer,
                "portfolio/projects/thumbnails",
            );
            updateData.thumbnail = {
                publicId: thumbnailResult.publicId,
                url: thumbnailResult.url,
            };
        }

        // Handle banner update
        if (req.files && req.files.banner) {
            // Delete old banner
            if (project.banner && project.banner.publicId) {
                await deleteFromCloudinary(project.banner.publicId);
            }
            // Upload new banner
            const bannerResult = await uploadToCloudinary(req.files.banner[0].buffer, "portfolio/projects/banners");
            updateData.banner = {
                publicId: bannerResult.publicId,
                url: bannerResult.url,
            };
        }

        // Handle gallery update
        if (req.files && req.files.gallery) {
            // Delete old gallery images
            if (project.gallery && project.gallery.length > 0) {
                const publicIds = project.gallery.map((img) => img.publicId);
                await deleteMultipleFromCloudinary(publicIds);
            }
            // Upload new gallery images
            const galleryResults = await uploadMultipleToCloudinary(req.files.gallery, "portfolio/projects/gallery");
            updateData.gallery = galleryResults.map((result) => ({
                publicId: result.publicId,
                url: result.url,
                name: result.publicId.split("/").pop(),
            }));
        }

        // Parse JSON fields if needed
        if (typeof updateData.technologies === "string") {
            updateData.technologies = JSON.parse(updateData.technologies);
        }
        if (typeof updateData.categories === "string") {
            updateData.categories = JSON.parse(updateData.categories);
        }

        project = await Project.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating project",
            error: error.message,
        });
    }
};

// @desc    Delete project
// @route   DELETE /api/admin/projects/:id
// @access  Private
exports.delete = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        // Delete images from Cloudinary
        if (project.thumbnail && project.thumbnail.publicId) {
            await deleteFromCloudinary(project.thumbnail.publicId);
        }

        if (project.banner && project.banner.publicId) {
            await deleteFromCloudinary(project.banner.publicId);
        }

        if (project.gallery && project.gallery.length > 0) {
            const publicIds = project.gallery.map((img) => img.publicId);
            await deleteMultipleFromCloudinary(publicIds);
        }

        // Delete project
        await Project.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting project",
            error: error.message,
        });
    }
};

// @desc    Toggle featured status
// @route   PATCH /api/admin/projects/:id/toggle-featured
// @access  Private
exports.toggleFeatured = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        project.featured = !project.featured;
        await project.save();

        res.status(200).json({
            success: true,
            message: `Project ${project.featured ? "featured" : "unfeatured"} successfully`,
            data: project,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error toggling featured status",
            error: error.message,
        });
    }
};

// @desc    Toggle publish status
// @route   PATCH /api/admin/projects/:id/toggle-publish
// @access  Private
exports.togglePublish = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        project.isPublished = !project.isPublished;
        await project.save();

        res.status(200).json({
            success: true,
            message: `Project ${project.isPublished ? "published" : "unpublished"} successfully`,
            data: project,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error toggling publish status",
            error: error.message,
        });
    }
};
