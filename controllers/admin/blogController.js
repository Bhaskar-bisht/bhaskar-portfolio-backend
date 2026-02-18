/** @format */

const Blog = require("../../src/models/Blog");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinaryUpload");
const { generateUniqueSlug } = require("../../utils/slugify");

// @desc    Get all blogs (Admin)
// @route   GET /api/admin/blogs
// @access  Private
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;

        let query = {};

        if (search) {
            query.$or = [{ title: { $regex: search, $options: "i" } }, { excerpt: { $regex: search, $options: "i" } }];
        }

        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Blog.countDocuments(query);

        const blogs = await Blog.find(query)
            .populate("tags", "name slug colorCode")
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        res.status(200).json({
            success: true,
            data: blogs,
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
            message: "Error fetching blogs",
            error: error.message,
        });
    }
};

// @desc    Get single blog
// @route   GET /api/admin/blogs/:id
// @access  Private
exports.getById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("tags").populate("userId");

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching blog",
            error: error.message,
        });
    }
};

// @desc    Create blog
// @route   POST /api/admin/blogs
// @access  Private
exports.create = async (req, res) => {
    try {
        const blogData = { ...req.body, userId: req.user._id };

        // Generate slug
        blogData.slug = await generateUniqueSlug(blogData.title, Blog);

        // Calculate reading time (rough estimate: 200 words per minute)
        if (blogData.body) {
            const wordCount = blogData.body.split(/\s+/).length;
            blogData.readingTime = Math.ceil(wordCount / 200);
        }

        // Handle featured image upload
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, "portfolio/blogs");
            blogData.featuredImage = {
                publicId: result.publicId,
                url: result.url,
            };
        }

        // Parse tags if string
        if (typeof blogData.tags === "string") {
            blogData.tags = JSON.parse(blogData.tags);
        }

        // Auto-publish if status is published and no publishedAt
        if (blogData.status === "published" && !blogData.publishedAt) {
            blogData.publishedAt = new Date();
        }

        const blog = await Blog.create(blogData);

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating blog",
            error: error.message,
        });
    }
};

// @desc    Update blog
// @route   PUT /api/admin/blogs/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        const updateData = { ...req.body };

        // Update slug if title changed
        if (updateData.title && updateData.title !== blog.title) {
            updateData.slug = await generateUniqueSlug(updateData.title, Blog, req.params.id);
        }

        // Recalculate reading time if body changed
        if (updateData.body) {
            const wordCount = updateData.body.split(/\s+/).length;
            updateData.readingTime = Math.ceil(wordCount / 200);
        }

        // Handle featured image update
        if (req.file) {
            // Delete old image
            if (blog.featuredImage && blog.featuredImage.publicId) {
                await deleteFromCloudinary(blog.featuredImage.publicId);
            }
            // Upload new image
            const result = await uploadToCloudinary(req.file.buffer, "portfolio/blogs");
            updateData.featuredImage = {
                publicId: result.publicId,
                url: result.url,
            };
        }

        // Parse tags if string
        if (typeof updateData.tags === "string") {
            updateData.tags = JSON.parse(updateData.tags);
        }

        // Set publishedAt if changing to published status
        if (updateData.status === "published" && blog.status !== "published" && !updateData.publishedAt) {
            updateData.publishedAt = new Date();
        }

        blog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating blog",
            error: error.message,
        });
    }
};

// @desc    Delete blog
// @route   DELETE /api/admin/blogs/:id
// @access  Private
exports.delete = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        // Delete featured image
        if (blog.featuredImage && blog.featuredImage.publicId) {
            await deleteFromCloudinary(blog.featuredImage.publicId);
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting blog",
            error: error.message,
        });
    }
};

// @desc    Toggle featured status
// @route   PATCH /api/admin/blogs/:id/toggle-featured
// @access  Private
exports.toggleFeatured = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        blog.isFeatured = !blog.isFeatured;
        await blog.save();

        res.status(200).json({
            success: true,
            message: `Blog ${blog.isFeatured ? "featured" : "unfeatured"} successfully`,
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error toggling featured status",
            error: error.message,
        });
    }
};

// @desc    Publish blog
// @route   PATCH /api/admin/blogs/:id/publish
// @access  Private
exports.publish = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        blog.status = "published";
        if (!blog.publishedAt) {
            blog.publishedAt = new Date();
        }
        await blog.save();

        res.status(200).json({
            success: true,
            message: "Blog published successfully",
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error publishing blog",
            error: error.message,
        });
    }
};

// @desc    Schedule blog
// @route   PATCH /api/admin/blogs/:id/schedule
// @access  Private
exports.schedule = async (req, res) => {
    try {
        const { scheduledAt } = req.body;

        if (!scheduledAt) {
            return res.status(400).json({
                success: false,
                message: "Please provide scheduled date and time",
            });
        }

        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                status: "scheduled",
                scheduledAt: new Date(scheduledAt),
            },
            { new: true },
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Blog scheduled successfully",
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error scheduling blog",
            error: error.message,
        });
    }
};
