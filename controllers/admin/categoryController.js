/** @format */

const Category = require("../../src/models/Category");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinaryUpload");
const { generateUniqueSlug } = require("../../utils/slugify");

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, active } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (active !== undefined) {
            query.isActive = active === "true";
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Category.countDocuments(query);

        const categories = await Category.find(query)
            .populate("parentId", "name")
            .sort({ displayOrder: 1, name: 1 })
            .limit(parseInt(limit))
            .skip(skip);

        res.status(200).json({
            success: true,
            data: categories,
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
            message: "Error fetching categories",
            error: error.message,
        });
    }
};

// @desc    Get single category
// @route   GET /api/admin/categories/:id
// @access  Private
exports.getById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate("parentId", "name");

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        res.status(200).json({
            success: true,
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching category",
            error: error.message,
        });
    }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private
exports.create = async (req, res) => {
    try {
        const categoryData = { ...req.body };

        // Generate slug
        categoryData.slug = await generateUniqueSlug(categoryData.name, Category);

        // Handle icon image upload
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, "portfolio/categories");
            categoryData.iconImage = {
                publicId: result.publicId,
                url: result.url,
            };
        }

        const category = await Category.create(categoryData);

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating category",
            error: error.message,
        });
    }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const updateData = { ...req.body };

        // Update slug if name changed
        if (updateData.name && updateData.name !== category.name) {
            updateData.slug = await generateUniqueSlug(updateData.name, Category, req.params.id);
        }

        // Handle icon update
        if (req.file) {
            // Delete old icon
            if (category.iconImage && category.iconImage.publicId) {
                await deleteFromCloudinary(category.iconImage.publicId);
            }
            // Upload new icon
            const result = await uploadToCloudinary(req.file.buffer, "portfolio/categories");
            updateData.iconImage = {
                publicId: result.publicId,
                url: result.url,
            };
        }

        category = await Category.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating category",
            error: error.message,
        });
    }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private
exports.delete = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // Check if category has children
        const children = await Category.find({ parentId: req.params.id });
        if (children.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category with subcategories. Delete subcategories first.",
            });
        }

        // Delete icon from Cloudinary
        if (category.iconImage && category.iconImage.publicId) {
            await deleteFromCloudinary(category.iconImage.publicId);
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting category",
            error: error.message,
        });
    }
};
