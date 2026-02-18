/** @format */

// ==================================================
// SEO METADATA CONTROLLER
// ==================================================
const SeoMetadata = require("../../src/models/SeoMetadata");

exports.seoMetadataController = {
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 20, seoableType } = req.query;
            let query = {};

            if (seoableType) query.seoableType = seoableType;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const total = await SeoMetadata.countDocuments(query);

            const seoData = await SeoMetadata.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(skip);

            res.status(200).json({
                success: true,
                data: seoData,
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
                message: "Error fetching SEO metadata",
                error: error.message,
            });
        }
    },

    getById: async (req, res) => {
        try {
            const seoData = await SeoMetadata.findById(req.params.id);
            if (!seoData) {
                return res.status(404).json({ success: false, message: "SEO metadata not found" });
            }
            res.status(200).json({ success: true, data: seoData });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching SEO metadata",
                error: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const seoData = { ...req.body };

            // Parse schema markup if string
            if (typeof seoData.schemaMarkup === "string") {
                seoData.schemaMarkup = JSON.parse(seoData.schemaMarkup);
            }

            if (req.file) {
                const result = await uploadToCloudinary(req.file.buffer, "portfolio/seo/og-images");
                seoData.ogImage = { publicId: result.publicId, url: result.url };
            }

            const metadata = await SeoMetadata.create(seoData);

            res.status(201).json({
                success: true,
                message: "SEO metadata created successfully",
                data: metadata,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating SEO metadata",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            let seoData = await SeoMetadata.findById(req.params.id);
            if (!seoData) {
                return res.status(404).json({ success: false, message: "SEO metadata not found" });
            }

            const updateData = { ...req.body };

            if (typeof updateData.schemaMarkup === "string") {
                updateData.schemaMarkup = JSON.parse(updateData.schemaMarkup);
            }

            if (req.file) {
                if (seoData.ogImage?.publicId) {
                    await deleteFromCloudinary(seoData.ogImage.publicId);
                }
                const result = await uploadToCloudinary(req.file.buffer, "portfolio/seo/og-images");
                updateData.ogImage = { publicId: result.publicId, url: result.url };
            }

            seoData = await SeoMetadata.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            });

            res.status(200).json({
                success: true,
                message: "SEO metadata updated successfully",
                data: seoData,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating SEO metadata",
                error: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const seoData = await SeoMetadata.findById(req.params.id);
            if (!seoData) {
                return res.status(404).json({ success: false, message: "SEO metadata not found" });
            }

            if (seoData.ogImage?.publicId) {
                await deleteFromCloudinary(seoData.ogImage.publicId);
            }

            await SeoMetadata.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "SEO metadata deleted successfully" });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting SEO metadata",
                error: error.message,
            });
        }
    },
};
