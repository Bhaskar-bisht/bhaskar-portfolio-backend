/** @format */

const Education = require("../../src/models/Education");
const { uploadToCloudinary, deleteFromCloudinary } = require("../../utils/cloudinaryUpload");

exports.educationController = {
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 20, userId } = req.query;
            let query = {};
            if (userId) query.userId = userId;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const total = await Education.countDocuments(query);

            const educations = await Education.find(query)
                .populate("userId", "name email")
                .sort({ displayOrder: 1, startDate: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            res.status(200).json({
                success: true,
                data: educations,
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
                message: "Error fetching education",
                error: error.message,
            });
        }
    },

    getById: async (req, res) => {
        try {
            const education = await Education.findById(req.params.id).populate("userId", "name email");
            if (!education) {
                return res.status(404).json({ success: false, message: "Education not found" });
            }
            res.status(200).json({ success: true, data: education });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching education",
                error: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const educationData = { ...req.body };
            if (!educationData.userId) educationData.userId = req.user._id;

            // Handle file uploads
            if (req.files) {
                if (req.files.institutionLogo) {
                    const result = await uploadToCloudinary(
                        req.files.institutionLogo[0].buffer,
                        "portfolio/education/logos",
                    );
                    educationData.institutionLogo = {
                        publicId: result.publicId,
                        url: result.url,
                    };
                }
                if (req.files.certificate) {
                    const result = await uploadToCloudinary(
                        req.files.certificate[0].buffer,
                        "portfolio/education/certificates",
                    );
                    educationData.certificate = {
                        publicId: result.publicId,
                        url: result.url,
                    };
                }
            }

            const education = await Education.create(educationData);
            await education.populate("userId", "name email");

            res.status(201).json({
                success: true,
                message: "Education created successfully",
                data: education,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating education",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            let education = await Education.findById(req.params.id);
            if (!education) {
                return res.status(404).json({ success: false, message: "Education not found" });
            }

            const updateData = { ...req.body };

            if (req.files) {
                if (req.files.institutionLogo) {
                    if (education.institutionLogo?.publicId) {
                        await deleteFromCloudinary(education.institutionLogo.publicId);
                    }
                    const result = await uploadToCloudinary(
                        req.files.institutionLogo[0].buffer,
                        "portfolio/education/logos",
                    );
                    updateData.institutionLogo = {
                        publicId: result.publicId,
                        url: result.url,
                    };
                }
                if (req.files.certificate) {
                    if (education.certificate?.publicId) {
                        await deleteFromCloudinary(education.certificate.publicId);
                    }
                    const result = await uploadToCloudinary(
                        req.files.certificate[0].buffer,
                        "portfolio/education/certificates",
                    );
                    updateData.certificate = {
                        publicId: result.publicId,
                        url: result.url,
                    };
                }
            }

            education = await Education.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
                runValidators: true,
            }).populate("userId", "name email");

            res.status(200).json({
                success: true,
                message: "Education updated successfully",
                data: education,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating education",
                error: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const education = await Education.findById(req.params.id);
            if (!education) {
                return res.status(404).json({ success: false, message: "Education not found" });
            }

            if (education.institutionLogo?.publicId) {
                await deleteFromCloudinary(education.institutionLogo.publicId);
            }
            if (education.certificate?.publicId) {
                await deleteFromCloudinary(education.certificate.publicId);
            }

            await Education.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Education deleted successfully" });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting education",
                error: error.message,
            });
        }
    },
};
