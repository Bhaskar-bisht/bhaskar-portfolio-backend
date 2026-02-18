/** @format */

const express = require("express");
const router = express.Router();

const portfolioController = require("../../controllers/portfolio/portfolioController");
const projectController = require("../../controllers/portfolio/projectController");
const blogController = require("../../controllers/portfolio/blogController");
const serviceController = require("../../controllers/portfolio/serviceController");
const contactController = require("../../controllers/portfolio/contactController");
const socialLinkController = require("../../controllers/portfolio/socialLinkController");

// ============================================
// PORTFOLIO OWNER (Main User) ROUTES
// ============================================
router.get("/profile", portfolioController.getProfile);
router.get("/profile/skills", portfolioController.getSkills);
router.get("/profile/education", portfolioController.getEducation);
router.get("/profile/experience", portfolioController.getExperience);
router.get("/profile/certifications", portfolioController.getCertifications);
router.get("/profile/achievements", portfolioController.getAchievements);
router.get("/profile/social-links", portfolioController.getSocialLinks);
router.get("/profile/stats", portfolioController.getStats);

// ============================================
// PROJECTS ROUTES
// ============================================
router.get("/projects", projectController.index);
router.get("/projects/featured", projectController.getFeatured);
router.get("/projects/:slug", projectController.show);
router.get("/projects/:slug/related", projectController.getRelated);

// ============================================
// BLOGS/ARTICLES ROUTES
// ============================================
router.get("/blogs", blogController.index);
router.get("/blogs/featured", blogController.getFeatured);
router.get("/blogs/latest", blogController.getLatest);
router.get("/blogs/:slug", blogController.show);
router.get("/blogs/:slug/related", blogController.getRelated);
router.post("/blogs/:slug/like", blogController.like);

// ============================================
// CATEGORIES ROUTES
// ============================================
router.get("/categories", projectController.getCategories);
router.get("/categories/:slug", projectController.getProjectsByCategory);

// ============================================
// TECHNOLOGIES/SKILLS ROUTES
// ============================================
router.get("/technologies", portfolioController.getTechnologies);
router.get("/technologies/featured", portfolioController.getFeaturedTechnologies);

// ============================================
// SERVICES ROUTES
// ============================================
router.get("/services", serviceController.index);
router.get("/services/featured", serviceController.getFeatured);
router.get("/services/:slug", serviceController.show);

// ============================================
// TESTIMONIALS ROUTES
// ============================================
router.get("/testimonials", portfolioController.getTestimonials);
router.get("/testimonials/featured", portfolioController.getFeaturedTestimonials);

// ============================================
// CONTACT ROUTES
// ============================================
router.post("/contact", contactController.submit);

// ============================================
// TAGS ROUTES (for blogs)
// ============================================
router.get("/tags", blogController.getTags);
router.get("/tags/:slug/blogs", blogController.getBlogsByTag);

// ============================================
// SEARCH & FILTERS
// ============================================
router.get("/search", portfolioController.search);

// ============================================
// PUBLIC STATS (for homepage)
// ============================================
router.get("/stats/overview", portfolioController.getOverviewStats);

// ============================================
// SOCIAL LINKS
// ============================================
router.get("/social-links", socialLinkController.index);

module.exports = router;
