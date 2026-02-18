/** @format */

const multer = require("multer");
const path = require("path");

// Configure multer for memory storage (we'll upload to Cloudinary from memory)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
    // Allowed image extensions
    const allowedImageTypes = /jpeg|jpg|png|gif|webp|svg/;
    // Allowed document extensions
    const allowedDocTypes = /pdf|doc|docx/;

    const extname = path.extname(file.originalname).toLowerCase().replace(".", "");
    const mimetype = file.mimetype;

    // Check if file is an image
    if (mimetype.startsWith("image/") && allowedImageTypes.test(extname)) {
        return cb(null, true);
    }

    // Check if file is a document (for resumes, certificates)
    if (mimetype.includes("pdf") || mimetype.includes("document") || allowedDocTypes.test(extname)) {
        return cb(null, true);
    }

    cb(
        new Error(
            `Error: File type not supported. Only ${allowedImageTypes} images and ${allowedDocTypes} documents are allowed.`,
        ),
    );
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: fileFilter,
});

// Export different upload configurations
module.exports = {
    // Single file upload
    uploadSingle: (fieldName) => upload.single(fieldName),

    // Multiple files upload
    uploadMultiple: (fieldName, maxCount = 10) => upload.array(fieldName, maxCount),

    // Multiple fields upload
    uploadFields: (fields) => upload.fields(fields),

    // Handle multer errors
    handleUploadError: (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "File size is too large. Maximum size is 10MB.",
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        next();
    },
};
