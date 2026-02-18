/** @format */

// ==================================================
// CERTIFICATION CONTROLLER
// ==================================================
const Certification = require("../../src/models/Certification");

exports.certificationController = {
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 20, userId } = req.query;
            let query = {};
            if (userId) query.userId = userId;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const total = await Certification.countDocuments(query);

            const certifications = await Certification.find(query)
                .populate("userId", "name email")
                .sort({ issueDate: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            res.status(200).json({
                success: true,
                data: certifications,
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
                message: "Error fetching certifications",
                error: error.message,
            });
        }
    },

    getById: async (req, res) => {
        try {
            const certification = await Certification.findById(req.params.id).populate("userId", "name email");
            if (!certification) {
                return res.status(404).json({ success: false, message: "Certification not found" });
            }
            res.status(200).json({ success: true, data: certification });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching certification",
                error: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const certData = { ...req.body };
            if (!certData.userId) certData.userId = req.user._id;

            if (req.file) {
                const result = await uploadToCloudinary(req.file.buffer, "portfolio/certifications");
                certData.certificate = { publicId: result.publicId, url: result.url };
            }

            const certification = await Certification.create(certData);
            await certification.populate("userId", "name email");

            res.status(201).json({
                success: true,
                message: "Certification created successfully",
                data: certification,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating certification",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            let certification = await Certification.findById(req.params.id);
            if (!certification) {
                return res.status(404).json({ success: false, message: "Certification not found" });
            }

            const updateData = { ...req.body };

            if (req.file) {
                if (certification.certificate?.publicId) {
                    await deleteFromCloudinary(certification.certificate.publicId);
                }
                const result = await uploadToCloudinary(req.file.buffer, "portfolio/certifications");
                updateData.certificate = { publicId: result.publicId, url: result.url };
            }

            certification = await Certification.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            }).populate("userId", "name email");

            res.status(200).json({
                success: true,
                message: "Certification updated successfully",
                data: certification,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating certification",
                error: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const certification = await Certification.findById(req.params.id);
            if (!certification) {
                return res.status(404).json({ success: false, message: "Certification not found" });
            }

            if (certification.certificate?.publicId) {
                await deleteFromCloudinary(certification.certificate.publicId);
            }

            await Certification.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Certification deleted successfully" });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting certification",
                error: error.message,
            });
        }
    },
};
