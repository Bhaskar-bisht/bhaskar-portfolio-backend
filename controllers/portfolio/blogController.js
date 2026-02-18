/** @format */

const Blog = require("../../src/models/Blog");
const Tag = require("../../src/models/Tag");

// @desc    Get all published blogs
// @route   GET /api/portfolio/blogs
// @access  Public
exports.index = async (req, res) => {
    try {
        const { search, tag, page = 1, per_page = 10 } = req.query;

        // Build query
        let query = { status: "published", publishedAt: { $lte: new Date() } };

        // Search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { excerpt: { $regex: search, $options: "i" } },
                { body: { $regex: search, $options: "i" } },
            ];
        }

        // Filter by tag
        if (tag) {
            const tagDoc = await Tag.findOne({ slug: tag });
            if (tagDoc) {
                query.tags = tagDoc._id;
            }
        }

        // Pagination
        const limit = parseInt(per_page);
        const skip = (parseInt(page) - 1) * limit;
        const total = await Blog.countDocuments(query);

        // Get blogs
        const blogs = await Blog.find(query)
            .populate("tags", "name slug colorCode")
            .populate("userId", "name avatar")
            .sort({ publishedAt: -1 })
            .limit(limit)
            .skip(skip);

        res.status(200).json({
            success: true,
            data: blogs,
            meta: {
                current_page: parseInt(page),
                last_page: Math.ceil(total / limit),
                per_page: limit,
                total: total,
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

// @desc    Get featured blogs
// @route   GET /api/portfolio/blogs/featured
// @access  Public
exports.getFeatured = async (req, res) => {
    try {
        const blogs = await Blog.find({
            status: "published",
            publishedAt: { $lte: new Date() },
            isFeatured: true,
        })
            .populate("tags", "name slug")
            .populate("userId", "name")
            .sort({ publishedAt: -1 })
            .limit(3);

        res.status(200).json({
            success: true,
            data: blogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching featured blogs",
            error: error.message,
        });
    }
};

// @desc    Get latest 5 blogs
// @route   GET /api/portfolio/blogs/latest
// @access  Public
exports.getLatest = async (req, res) => {
    try {
        const blogs = await Blog.find({
            status: "published",
            publishedAt: { $lte: new Date() },
        })
            .populate("tags", "name slug")
            .select("title slug publishedAt readingTime")
            .sort({ publishedAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: blogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching latest blogs",
            error: error.message,
        });
    }
};

// @desc    Get single blog by slug
// @route   GET /api/portfolio/blogs/:slug
// @access  Public
exports.show = async (req, res) => {
    try {
        const blog = await Blog.findOne({
            slug: req.params.slug,
            status: "published",
            publishedAt: { $lte: new Date() },
        })
            .populate("tags")
            .populate("userId", "name bio avatar");

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        // Increment views
        blog.viewsCount += 1;
        await blog.save();

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

// @desc    Get related blogs
// @route   GET /api/portfolio/blogs/:slug/related
// @access  Public
exports.getRelated = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug }).populate("tags");

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        const tagIds = blog.tags.map((tag) => tag._id);

        const relatedBlogs = await Blog.find({
            _id: { $ne: blog._id },
            status: "published",
            publishedAt: { $lte: new Date() },
            tags: { $in: tagIds },
        })
            .populate("tags", "name slug")
            .sort({ publishedAt: -1 })
            .limit(3);

        res.status(200).json({
            success: true,
            data: relatedBlogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching related blogs",
            error: error.message,
        });
    }
};

// @desc    Like a blog
// @route   POST /api/portfolio/blogs/:slug/like
// @access  Public
exports.like = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        blog.likesCount += 1;
        await blog.save();

        res.status(200).json({
            success: true,
            message: "Blog liked successfully",
            likesCount: blog.likesCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error liking blog",
            error: error.message,
        });
    }
};

// @desc    Get all tags
// @route   GET /api/portfolio/tags
// @access  Public
exports.getTags = async (req, res) => {
    try {
        const tags = await Tag.find();

        // Get blog count for each tag
        const tagsWithCount = await Promise.all(
            tags.map(async (tag) => {
                const blogCount = await Blog.countDocuments({
                    tags: tag._id,
                    status: "published",
                });
                return {
                    ...tag.toObject(),
                    blogsCount: blogCount,
                };
            }),
        );

        // Filter tags with at least one blog
        const activeTags = tagsWithCount.filter((tag) => tag.blogsCount > 0);

        res.status(200).json({
            success: true,
            data: activeTags,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching tags",
            error: error.message,
        });
    }
};

// @desc    Get blogs by tag
// @route   GET /api/portfolio/tags/:slug/blogs
// @access  Public
exports.getBlogsByTag = async (req, res) => {
    try {
        const tag = await Tag.findOne({ slug: req.params.slug });

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: "Tag not found",
            });
        }

        const { page = 1, per_page = 10 } = req.query;
        const limit = parseInt(per_page);
        const skip = (parseInt(page) - 1) * limit;

        const query = {
            tags: tag._id,
            status: "published",
            publishedAt: { $lte: new Date() },
        };

        const total = await Blog.countDocuments(query);

        const blogs = await Blog.find(query)
            .populate("tags", "name slug")
            .populate("userId", "name")
            .sort({ publishedAt: -1 })
            .limit(limit)
            .skip(skip);

        res.status(200).json({
            success: true,
            tag: tag.name,
            data: blogs,
            meta: {
                current_page: parseInt(page),
                last_page: Math.ceil(total / limit),
                total: total,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching blogs by tag",
            error: error.message,
        });
    }
};
