/** @format */

const Skill = require("../../src/models/Skill");

// @desc    Get all skills
// @route   GET /api/admin/skills
// @access  Private
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 20, userId } = req.query;

        let query = {};

        if (userId) {
            query.userId = userId;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Skill.countDocuments(query);

        const skills = await Skill.find(query)
            .populate("userId", "name email")
            .populate("technologyId", "name logo category")
            .sort({ displayOrder: 1 })
            .limit(parseInt(limit))
            .skip(skip);

        res.status(200).json({
            success: true,
            data: skills,
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
            message: "Error fetching skills",
            error: error.message,
        });
    }
};

// @desc    Get single skill
// @route   GET /api/admin/skills/:id
// @access  Private
exports.getById = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id)
            .populate("userId", "name email")
            .populate("technologyId", "name logo");

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        res.status(200).json({
            success: true,
            data: skill,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching skill",
            error: error.message,
        });
    }
};

// @desc    Create skill
// @route   POST /api/admin/skills
// @access  Private
exports.create = async (req, res) => {
    try {
        const skillData = { ...req.body };

        // Use logged in user if userId not provided
        if (!skillData.userId) {
            skillData.userId = req.user._id;
        }

        const skill = await Skill.create(skillData);

        // Populate before sending response
        await skill.populate("userId", "name email");
        await skill.populate("technologyId", "name logo");

        res.status(201).json({
            success: true,
            message: "Skill created successfully",
            data: skill,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating skill",
            error: error.message,
        });
    }
};

// @desc    Update skill
// @route   PUT /api/admin/skills/:id
// @access  Private
exports.update = async (req, res) => {
    try {
        let skill = await Skill.findById(req.params.id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
            .populate("userId", "name email")
            .populate("technologyId", "name logo");

        res.status(200).json({
            success: true,
            message: "Skill updated successfully",
            data: skill,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating skill",
            error: error.message,
        });
    }
};

// @desc    Delete skill
// @route   DELETE /api/admin/skills/:id
// @access  Private
exports.delete = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        await Skill.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Skill deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting skill",
            error: error.message,
        });
    }
};

// @desc    Bulk create skills
// @route   POST /api/admin/skills/bulk
// @access  Private
exports.bulkCreate = async (req, res) => {
    try {
        const { skills } = req.body;

        if (!skills || !Array.isArray(skills)) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of skills",
            });
        }

        // Add userId to all skills
        const skillsWithUser = skills.map((skill) => ({
            ...skill,
            userId: skill.userId || req.user._id,
        }));

        const createdSkills = await Skill.insertMany(skillsWithUser);

        res.status(201).json({
            success: true,
            message: `${createdSkills.length} skills created successfully`,
            data: createdSkills,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating skills",
            error: error.message,
        });
    }
};
