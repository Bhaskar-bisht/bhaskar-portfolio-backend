/** @format */

// ==================================================
// SERVICE CONTROLLER
// ==================================================
const Service = require("../../src/models/Service");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinaryUpload");
const { generateUniqueSlug } = require("../../utils/slugify");

exports.serviceController = {
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 20, active, featured } = req.query;
            let query = {};

            if (active !== undefined) query.isActive = active === "true";
            if (featured !== undefined) query.isFeatured = featured === "true";

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const total = await Service.countDocuments(query);

            const services = await Service.find(query).sort({ displayOrder: 1 }).limit(parseInt(limit)).skip(skip);

            res.status(200).json({
                success: true,
                data: services,
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
                message: "Error fetching services",
                error: error.message,
            });
        }
    },

    getById: async (req, res) => {
        try {
            const service = await Service.findById(req.params.id);
            if (!service) {
                return res.status(404).json({ success: false, message: "Service not found" });
            }
            res.status(200).json({ success: true, data: service });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching service",
                error: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const serviceData = { ...req.body };
            serviceData.slug = await generateUniqueSlug(serviceData.title, Service);

            // Parse features if string
            if (typeof serviceData.features === "string") {
                serviceData.features = JSON.parse(serviceData.features);
            }

            if (req.file) {
                const result = await uploadToCloudinary(req.file.buffer, "portfolio/services");
                serviceData.thumbnail = { publicId: result.publicId, url: result.url };
            }

            const service = await Service.create(serviceData);

            res.status(201).json({
                success: true,
                message: "Service created successfully",
                data: service,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating service",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            let service = await Service.findById(req.params.id);
            if (!service) {
                return res.status(404).json({ success: false, message: "Service not found" });
            }

            const updateData = { ...req.body };

            if (updateData.title && updateData.title !== service.title) {
                updateData.slug = await generateUniqueSlug(updateData.title, Service, req.params.id);
            }

            if (typeof updateData.features === "string") {
                updateData.features = JSON.parse(updateData.features);
            }

            if (req.file) {
                if (service.thumbnail?.publicId) {
                    await deleteFromCloudinary(service.thumbnail.publicId);
                }
                const result = await uploadToCloudinary(req.file.buffer, "portfolio/services");
                updateData.thumbnail = { publicId: result.publicId, url: result.url };
            }

            service = await Service.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            });

            res.status(200).json({
                success: true,
                message: "Service updated successfully",
                data: service,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating service",
                error: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const service = await Service.findById(req.params.id);
            if (!service) {
                return res.status(404).json({ success: false, message: "Service not found" });
            }

            if (service.thumbnail?.publicId) {
                await deleteFromCloudinary(service.thumbnail.publicId);
            }

            await Service.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Service deleted successfully" });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting service",
                error: error.message,
            });
        }
    },

    toggleFeatured: async (req, res) => {
        try {
            const service = await Service.findById(req.params.id);
            if (!service) {
                return res.status(404).json({ success: false, message: "Service not found" });
            }

            service.isFeatured = !service.isFeatured;
            await service.save();

            res.status(200).json({
                success: true,
                message: `Service ${service.isFeatured ? "featured" : "unfeatured"} successfully`,
                data: service,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error toggling featured status",
                error: error.message,
            });
        }
    },
};
