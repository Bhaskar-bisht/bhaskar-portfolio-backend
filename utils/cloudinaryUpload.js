/** @format */

const { cloudinary } = require("../src/config/cloudinary");
const streamifier = require("streamifier");

/**
 * Upload image to Cloudinary from buffer
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @param {Object} options - Additional Cloudinary options
 * @returns {Promise<Object>} - Upload result with publicId and url
 */
const uploadToCloudinary = (fileBuffer, folder = "portfolio", options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: "auto",
                ...options,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        publicId: result.public_id,
                        url: result.secure_url,
                        format: result.format,
                        width: result.width,
                        height: result.height,
                    });
                }
            },
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
    }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of file buffers from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Array>} - Array of upload results
 */
const uploadMultipleToCloudinary = async (files, folder = "portfolio") => {
    const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer, folder));
    return await Promise.all(uploadPromises);
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<Array>} - Array of deletion results
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
    const deletePromises = publicIds.map((publicId) => deleteFromCloudinary(publicId));
    return await Promise.all(deletePromises);
};

/**
 * Update image in Cloudinary (delete old and upload new)
 * @param {String} oldPublicId - Old image public ID to delete
 * @param {Buffer} newFileBuffer - New file buffer to upload
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Object>} - New upload result
 */
const updateImageInCloudinary = async (oldPublicId, newFileBuffer, folder = "portfolio") => {
    // Delete old image if exists
    if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
    }

    // Upload new image
    return await uploadToCloudinary(newFileBuffer, folder);
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    uploadMultipleToCloudinary,
    deleteMultipleFromCloudinary,
    updateImageInCloudinary,
};
