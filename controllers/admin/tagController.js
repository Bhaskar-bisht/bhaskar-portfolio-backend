/** @format */

// ==================================================
// TAG CONTROLLER
// ==================================================
const Tag = require("../../src/models/Tag");
const { generateUniqueSlug } = require("../../utils/slugify");

exports.tagController = {
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 50, search } = req.query;
            let query = {};

            if (search) {
                query.name = { $regex: search, $options: "i" };
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const total = await Tag.countDocuments(query);

            const tags = await Tag.find(query).sort({ name: 1 }).limit(parseInt(limit)).skip(skip);

            res.status(200).json({
                success: true,
                data: tags,
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
                message: "Error fetching tags",
                error: error.message,
            });
        }
    },

    getById: async (req, res) => {
        try {
            const tag = await Tag.findById(req.params.id);
            if (!tag) {
                return res.status(404).json({ success: false, message: "Tag not found" });
            }
            res.status(200).json({ success: true, data: tag });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching tag",
                error: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const tagData = { ...req.body };
            tagData.slug = await generateUniqueSlug(tagData.name, Tag);

            const tag = await Tag.create(tagData);

            res.status(201).json({
                success: true,
                message: "Tag created successfully",
                data: tag,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating tag",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            let tag = await Tag.findById(req.params.id);
            if (!tag) {
                return res.status(404).json({ success: false, message: "Tag not found" });
            }

            const updateData = { ...req.body };
            if (updateData.name && updateData.name !== tag.name) {
                updateData.slug = await generateUniqueSlug(updateData.name, Tag, req.params.id);
            }

            tag = await Tag.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            });

            res.status(200).json({
                success: true,
                message: "Tag updated successfully",
                data: tag,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating tag",
                error: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const tag = await Tag.findById(req.params.id);
            if (!tag) {
                return res.status(404).json({ success: false, message: "Tag not found" });
            }

            await Tag.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Tag deleted successfully" });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting tag",
                error: error.message,
            });
        }
    },
};
