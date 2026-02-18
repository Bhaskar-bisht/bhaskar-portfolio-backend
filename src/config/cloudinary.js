/** @format */

const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection
const testConnection = async () => {
    try {
        const result = await cloudinary.api.ping();
        console.log("✅ Cloudinary Connected:", result.status);
    } catch (error) {
        console.error("❌ Cloudinary Connection Error:", error.message);
    }
};

module.exports = { cloudinary, testConnection };
