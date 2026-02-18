/**
 * Generic CRUD Controller Factory
 * This creates standard CRUD operations for any model
 * Usage: const controller = createCRUDController(Model, 'modelName');
 *
 * @format
 */

const { uploadToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinaryUpload");
const { generateUniqueSlug } = require("../../utils/slugify");

const createCRUDController = (Model, modelName, options = {}) => {
    const {
        populateFields = [],
        searchFields = ["name", "title"],
        hasSlug = true,
        hasImages = false,
        imageField = "image",
        cloudinaryFolder = `portfolio/${modelName}`,
    } = options;

    return {
        // Get all
        getAll: async (req, res) => {
            try {
                const { page = 1, limit = 10, search, sort = "-createdAt" } = req.query;

                let query = {};

                // Search
                if (search) {
                    query.$or = searchFields.map((field) => ({
                        [field]: { $regex: search, $options: "i" },
                    }));
                }

                // Pagination
                const skip = (parseInt(page) - 1) * parseInt(limit);
                const total = await Model.countDocuments(query);

                let queryBuilder = Model.find(query);

                // Populate if needed
                if (populateFields.length > 0) {
                    populateFields.forEach((field) => {
                        queryBuilder = queryBuilder.populate(field);
                    });
                }

                const data = await queryBuilder.sort(sort).limit(parseInt(limit)).skip(skip);

                res.status(200).json({
                    success: true,
                    data,
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
                    message: `Error fetching ${modelName}`,
                    error: error.message,
                });
            }
        },

        // Get by ID
        getById: async (req, res) => {
            try {
                let query = Model.findById(req.params.id);

                if (populateFields.length > 0) {
                    populateFields.forEach((field) => {
                        query = query.populate(field);
                    });
                }

                const data = await query;

                if (!data) {
                    return res.status(404).json({
                        success: false,
                        message: `${modelName} not found`,
                    });
                }

                res.status(200).json({
                    success: true,
                    data,
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Error fetching ${modelName}`,
                    error: error.message,
                });
            }
        },

        // Create
        create: async (req, res) => {
            try {
                const createData = { ...req.body };

                // Add userId if exists
                if (req.user) {
                    createData.userId = req.user._id;
                }

                // Generate slug if needed
                if (hasSlug && (createData.title || createData.name)) {
                    const slugText = createData.title || createData.name;
                    createData.slug = await generateUniqueSlug(slugText, Model);
                }

                // Handle single image upload
                if (hasImages && req.file) {
                    const result = await uploadToCloudinary(req.file.buffer, cloudinaryFolder);
                    createData[imageField] = {
                        publicId: result.publicId,
                        url: result.url,
                    };
                }

                const data = await Model.create(createData);

                res.status(201).json({
                    success: true,
                    message: `${modelName} created successfully`,
                    data,
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Error creating ${modelName}`,
                    error: error.message,
                });
            }
        },

        // Update
        update: async (req, res) => {
            try {
                let data = await Model.findById(req.params.id);

                if (!data) {
                    return res.status(404).json({
                        success: false,
                        message: `${modelName} not found`,
                    });
                }

                const updateData = { ...req.body };

                // Update slug if title/name changed
                if (
                    hasSlug &&
                    (updateData.title || updateData.name) &&
                    (updateData.title !== data.title || updateData.name !== data.name)
                ) {
                    const slugText = updateData.title || updateData.name;
                    updateData.slug = await generateUniqueSlug(slugText, Model, req.params.id);
                }

                // Handle image update
                if (hasImages && req.file) {
                    // Delete old image
                    if (data[imageField] && data[imageField].publicId) {
                        await deleteFromCloudinary(data[imageField].publicId);
                    }
                    // Upload new image
                    const result = await uploadToCloudinary(req.file.buffer, cloudinaryFolder);
                    updateData[imageField] = {
                        publicId: result.publicId,
                        url: result.url,
                    };
                }

                data = await Model.findByIdAndUpdate(req.params.id, updateData, {
                    new: true,
                    runValidators: true,
                });

                res.status(200).json({
                    success: true,
                    message: `${modelName} updated successfully`,
                    data,
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Error updating ${modelName}`,
                    error: error.message,
                });
            }
        },

        // Delete
        delete: async (req, res) => {
            try {
                const data = await Model.findById(req.params.id);

                if (!data) {
                    return res.status(404).json({
                        success: false,
                        message: `${modelName} not found`,
                    });
                }

                // Delete image from Cloudinary if exists
                if (hasImages && data[imageField] && data[imageField].publicId) {
                    await deleteFromCloudinary(data[imageField].publicId);
                }

                await Model.findByIdAndDelete(req.params.id);

                res.status(200).json({
                    success: true,
                    message: `${modelName} deleted successfully`,
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Error deleting ${modelName}`,
                    error: error.message,
                });
            }
        },
    };
};

module.exports = createCRUDController;
