/** @format */

// ==================================================
// TESTIMONIAL CONTROLLER
// ==================================================
const Testimonial = require("../../src/models/Testimonial");

exports.testimonialController = {
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 20, approved, featured } = req.query;
            let query = {};

            if (approved !== undefined) query.isApproved = approved === "true";
            if (featured !== undefined) query.isFeatured = featured === "true";

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const total = await Testimonial.countDocuments(query);

            const testimonials = await Testimonial.find(query)
                .sort({ displayOrder: 1, createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            res.status(200).json({
                success: true,
                data: testimonials,
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
                message: "Error fetching testimonials",
                error: error.message,
            });
        }
    },

    getById: async (req, res) => {
        try {
            const testimonial = await Testimonial.findById(req.params.id);
            if (!testimonial) {
                return res.status(404).json({ success: false, message: "Testimonial not found" });
            }
            res.status(200).json({ success: true, data: testimonial });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching testimonial",
                error: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const testimonialData = { ...req.body };

            if (req.files) {
                if (req.files.avatar) {
                    const result = await uploadToCloudinary(
                        req.files.avatar[0].buffer,
                        "portfolio/testimonials/avatars",
                    );
                    testimonialData.avatar = { publicId: result.publicId, url: result.url };
                }
                if (req.files.companyLogo) {
                    const result = await uploadToCloudinary(
                        req.files.companyLogo[0].buffer,
                        "portfolio/testimonials/logos",
                    );
                    testimonialData.companyLogo = {
                        publicId: result.publicId,
                        url: result.url,
                    };
                }
            }

            const testimonial = await Testimonial.create(testimonialData);

            res.status(201).json({
                success: true,
                message: "Testimonial created successfully",
                data: testimonial,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating testimonial",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            let testimonial = await Testimonial.findById(req.params.id);
            if (!testimonial) {
                return res.status(404).json({ success: false, message: "Testimonial not found" });
            }

            const updateData = { ...req.body };

            if (req.files) {
                if (req.files.avatar) {
                    if (testimonial.avatar?.publicId) {
                        await deleteFromCloudinary(testimonial.avatar.publicId);
                    }
                    const result = await uploadToCloudinary(
                        req.files.avatar[0].buffer,
                        "portfolio/testimonials/avatars",
                    );
                    updateData.avatar = { publicId: result.publicId, url: result.url };
                }
                if (req.files.companyLogo) {
                    if (testimonial.companyLogo?.publicId) {
                        await deleteFromCloudinary(testimonial.companyLogo.publicId);
                    }
                    const result = await uploadToCloudinary(
                        req.files.companyLogo[0].buffer,
                        "portfolio/testimonials/logos",
                    );
                    updateData.companyLogo = {
                        publicId: result.publicId,
                        url: result.url,
                    };
                }
            }

            testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            });

            res.status(200).json({
                success: true,
                message: "Testimonial updated successfully",
                data: testimonial,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating testimonial",
                error: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const testimonial = await Testimonial.findById(req.params.id);
            if (!testimonial) {
                return res.status(404).json({ success: false, message: "Testimonial not found" });
            }

            if (testimonial.avatar?.publicId) {
                await deleteFromCloudinary(testimonial.avatar.publicId);
            }
            if (testimonial.companyLogo?.publicId) {
                await deleteFromCloudinary(testimonial.companyLogo.publicId);
            }

            await Testimonial.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Testimonial deleted successfully" });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting testimonial",
                error: error.message,
            });
        }
    },

    toggleApproved: async (req, res) => {
        try {
            const testimonial = await Testimonial.findById(req.params.id);
            if (!testimonial) {
                return res.status(404).json({ success: false, message: "Testimonial not found" });
            }

            testimonial.isApproved = !testimonial.isApproved;
            await testimonial.save();

            res.status(200).json({
                success: true,
                message: `Testimonial ${testimonial.isApproved ? "approved" : "unapproved"} successfully`,
                data: testimonial,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error toggling approval status",
                error: error.message,
            });
        }
    },

    toggleFeatured: async (req, res) => {
        try {
            const testimonial = await Testimonial.findById(req.params.id);
            if (!testimonial) {
                return res.status(404).json({ success: false, message: "Testimonial not found" });
            }

            testimonial.isFeatured = !testimonial.isFeatured;
            await testimonial.save();

            res.status(200).json({
                success: true,
                message: `Testimonial ${testimonial.isFeatured ? "featured" : "unfeatured"} successfully`,
                data: testimonial,
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
