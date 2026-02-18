/** @format */

const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../../middleware/auth");
const { uploadSingle, uploadFields, handleUploadError } = require("../../middleware/upload");

// Import controllers
const authController = require("../../controllers/admin/authController");
const userController = require("../../controllers/admin/userController");
const projectController = require("../../controllers/admin/projectController");
const blogController = require("../../controllers/admin/blogController");
const technologyController = require("../../controllers/admin/technologyController");
const categoryController = require("../../controllers/admin/categoryController");
const skillController = require("../../controllers/admin/skillController");
const experienceController = require("../../controllers/admin/experienceController");

// Import from allOtherControllers
// const {
//     educationController,
//     certificationController,
//     achievementController,
//     tagController,
//     testimonialController,
//     analyticController,
// } = require("../../controllers/admin/");

// Import from remainingControllers
// const {
//     serviceController,
//     socialLinkController,
//     contactController,
//     seoMetadataController,
//     settingController,
// } = require("../../controllers/admin/remainingControllers");
const { educationController } = require("../../controllers/admin/educationController");
const { certificationController } = require("../../controllers/admin/certificationController");
const { achievementController } = require("../../controllers/admin/achievementController");
const { tagController } = require("../../controllers/admin/tagController");
const { testimonialController } = require("../../controllers/admin/testimonialController");
const { analyticController } = require("../../controllers/admin/analyticController");
const { serviceController } = require("../../controllers/admin/serviceController");
const { socialLinkController } = require("../../controllers/admin/socialLinkController");
const { contactController } = require("../../controllers/admin/contactController");
const { seoMetadataController } = require("../../controllers/admin/seoMetadataController");
const { settingController } = require("../../controllers/admin/settingController");

// ============================================
// AUTHENTICATION ROUTES (Public)
// ============================================
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

const apiLogController = require("../../controllers/admin/apiLogController");

// ============================================
// PROTECTED ROUTES (All routes below require authentication)
// ============================================
router.use(protect);
router.use(authorize("admin"));

// Auth routes (protected)
router.get("/auth/me", authController.getMe);
router.put("/auth/update-profile", authController.updateProfile);
router.put("/auth/update-password", authController.updatePassword);
router.post("/auth/logout", authController.logout);

// ============================================
// USER ROUTES
// ============================================
router.get("/users", userController.getAll);
router.get("/users/:id", userController.getById);
router.put(
    "/users/:id",
    uploadFields([
        { name: "avatar", maxCount: 1 },
        { name: "resume", maxCount: 1 },
    ]),
    handleUploadError,
    userController.update,
);
router.delete("/users/:id", userController.delete);

// ============================================
// PROJECT ROUTES
// ============================================
router.get("/projects", projectController.getAll);
router.get("/projects/:id", projectController.getById);
router.post(
    "/projects",
    uploadFields([
        { name: "thumbnail", maxCount: 1 },
        { name: "banner", maxCount: 1 },
        { name: "gallery", maxCount: 10 },
    ]),
    handleUploadError,
    projectController.create,
);
router.put(
    "/projects/:id",
    uploadFields([
        { name: "thumbnail", maxCount: 1 },
        { name: "banner", maxCount: 1 },
        { name: "gallery", maxCount: 10 },
    ]),
    handleUploadError,
    projectController.update,
);
router.delete("/projects/:id", projectController.delete);
router.patch("/projects/:id/toggle-featured", projectController.toggleFeatured);
router.patch("/projects/:id/toggle-publish", projectController.togglePublish);

// ============================================
// BLOG ROUTES
// ============================================
router.get("/blogs", blogController.getAll);
router.get("/blogs/:id", blogController.getById);
router.post("/blogs", uploadSingle("featuredImage"), handleUploadError, blogController.create);
router.put("/blogs/:id", uploadSingle("featuredImage"), handleUploadError, blogController.update);
router.delete("/blogs/:id", blogController.delete);
router.patch("/blogs/:id/toggle-featured", blogController.toggleFeatured);
router.patch("/blogs/:id/publish", blogController.publish);
router.patch("/blogs/:id/schedule", blogController.schedule);

// ============================================
// TECHNOLOGY ROUTES
// ============================================
router.get("/technologies", technologyController.getAll);
router.get("/technologies/:id", technologyController.getById);
router.post("/technologies", uploadSingle("logo"), handleUploadError, technologyController.create);
router.put("/technologies/:id", uploadSingle("logo"), handleUploadError, technologyController.update);
router.delete("/technologies/:id", technologyController.delete);
router.patch("/technologies/:id/toggle-featured", technologyController.toggleFeatured);

// ============================================
// CATEGORY ROUTES
// ============================================
router.get("/categories", categoryController.getAll);
router.get("/categories/:id", categoryController.getById);
router.post("/categories", uploadSingle("iconImage"), handleUploadError, categoryController.create);
router.put("/categories/:id", uploadSingle("iconImage"), handleUploadError, categoryController.update);
router.delete("/categories/:id", categoryController.delete);

// ============================================
// SKILL ROUTES
// ============================================
router.get("/skills", skillController.getAll);
router.get("/skills/:id", skillController.getById);
router.post("/skills", skillController.create);
router.put("/skills/:id", skillController.update);
router.delete("/skills/:id", skillController.delete);
router.post("/skills/bulk", skillController.bulkCreate);

// ============================================
// EXPERIENCE ROUTES
// ============================================
router.get("/experiences", experienceController.getAll);
router.get("/experiences/:id", experienceController.getById);
router.post("/experiences", uploadSingle("companyLogo"), handleUploadError, experienceController.create);
router.put("/experiences/:id", uploadSingle("companyLogo"), handleUploadError, experienceController.update);
router.delete("/experiences/:id", experienceController.delete);

// ============================================
// EDUCATION ROUTES
// ============================================
router.get("/educations", educationController.getAll);
router.get("/educations/:id", educationController.getById);
router.post(
    "/educations",
    uploadFields([
        { name: "institutionLogo", maxCount: 1 },
        { name: "certificate", maxCount: 1 },
    ]),
    handleUploadError,
    educationController.create,
);
router.put(
    "/educations/:id",
    uploadFields([
        { name: "institutionLogo", maxCount: 1 },
        { name: "certificate", maxCount: 1 },
    ]),
    handleUploadError,
    educationController.update,
);
router.delete("/educations/:id", educationController.delete);

// ============================================
// CERTIFICATION ROUTES
// ============================================
router.get("/certifications", certificationController.getAll);
router.get("/certifications/:id", certificationController.getById);
router.post("/certifications", uploadSingle("certificate"), handleUploadError, certificationController.create);
router.put("/certifications/:id", uploadSingle("certificate"), handleUploadError, certificationController.update);
router.delete("/certifications/:id", certificationController.delete);

// ============================================
// ACHIEVEMENT ROUTES
// ============================================
router.get("/achievements", achievementController.getAll);
router.get("/achievements/:id", achievementController.getById);
router.post("/achievements", uploadSingle("certificate"), handleUploadError, achievementController.create);
router.put("/achievements/:id", uploadSingle("certificate"), handleUploadError, achievementController.update);
router.delete("/achievements/:id", achievementController.delete);
router.patch("/achievements/:id/toggle-featured", achievementController.toggleFeatured);

// ============================================
// SERVICE ROUTES
// ============================================
router.get("/services", serviceController.getAll);
router.get("/services/:id", serviceController.getById);
router.post("/services", uploadSingle("thumbnail"), handleUploadError, serviceController.create);
router.put("/services/:id", uploadSingle("thumbnail"), handleUploadError, serviceController.update);
router.delete("/services/:id", serviceController.delete);
router.patch("/services/:id/toggle-featured", serviceController.toggleFeatured);

// ============================================
// TESTIMONIAL ROUTES
// ============================================
router.get("/testimonials", testimonialController.getAll);
router.get("/testimonials/:id", testimonialController.getById);
router.post(
    "/testimonials",
    uploadFields([
        { name: "avatar", maxCount: 1 },
        { name: "companyLogo", maxCount: 1 },
    ]),
    handleUploadError,
    testimonialController.create,
);
router.put(
    "/testimonials/:id",
    uploadFields([
        { name: "avatar", maxCount: 1 },
        { name: "companyLogo", maxCount: 1 },
    ]),
    handleUploadError,
    testimonialController.update,
);
router.delete("/testimonials/:id", testimonialController.delete);
router.patch("/testimonials/:id/toggle-approved", testimonialController.toggleApproved);
router.patch("/testimonials/:id/toggle-featured", testimonialController.toggleFeatured);

// ============================================
// SOCIAL LINK ROUTES
// ============================================
router.get("/social-links", socialLinkController.getAll);
router.get("/social-links/:id", socialLinkController.getById);
router.post("/social-links", socialLinkController.create);
router.put("/social-links/:id", socialLinkController.update);
router.delete("/social-links/:id", socialLinkController.delete);

// ============================================
// TAG ROUTES
// ============================================
router.get("/tags", tagController.getAll);
router.get("/tags/:id", tagController.getById);
router.post("/tags", tagController.create);
router.put("/tags/:id", tagController.update);
router.delete("/tags/:id", tagController.delete);

// ============================================
// CONTACT MESSAGE ROUTES
// ============================================
router.get("/contacts", contactController.getAll);
router.get("/contacts/:id", contactController.getById);
router.patch("/contacts/:id/read", contactController.markAsRead);
router.post("/contacts/:id/reply", contactController.reply);
router.delete("/contacts/:id", contactController.delete);

// ============================================
// SETTINGS ROUTES
// ============================================
router.get("/settings", settingController.getAll);
router.get("/settings/key/:key", settingController.getByKey);
router.post("/settings", settingController.create);
router.put("/settings/key/:key", settingController.updateByKey);
router.put("/settings/:id", settingController.update);
router.delete("/settings/:id", settingController.delete);

// ============================================
// SEO METADATA ROUTES
// ============================================
router.get("/seo-metadata", seoMetadataController.getAll);
router.get("/seo-metadata/:id", seoMetadataController.getById);
router.post("/seo-metadata", uploadSingle("ogImage"), handleUploadError, seoMetadataController.create);
router.put("/seo-metadata/:id", uploadSingle("ogImage"), handleUploadError, seoMetadataController.update);
router.delete("/seo-metadata/:id", seoMetadataController.delete);

// ============================================
// ANALYTICS ROUTES
// ============================================
router.get("/analytics", analyticController.getAll);
router.get("/analytics/stats", analyticController.getStats);
router.delete("/analytics/:id", analyticController.delete);

router.get("/api-logs", apiLogController.index);
router.get("/api-logs/stats", apiLogController.getStats);
router.get("/api-logs/:id", apiLogController.show);
router.delete("/api-logs/:id", apiLogController.destroy);
router.delete("/api-logs/bulk/date-range", apiLogController.deleteByDateRange);
router.delete("/api-logs/bulk/method", apiLogController.deleteByMethod);
router.delete("/api-logs/bulk/all", apiLogController.deleteAll);

module.exports = router;
