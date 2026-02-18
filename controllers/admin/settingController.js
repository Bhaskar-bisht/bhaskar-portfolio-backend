/** @format */

// ==================================================
// SETTINGS CONTROLLER
// ==================================================
const Setting = require("../../src/models/Setting");

exports.settingController = {
    getAll: async (req, res) => {
        try {
            const { group } = req.query;
            let query = {};

            if (group) query.group = group;

            const settings = await Setting.find(query).sort({ group: 1, key: 1 });

            res.status(200).json({
                success: true,
                data: settings,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching settings",
                error: error.message,
            });
        }
    },

    getByKey: async (req, res) => {
        try {
            const setting = await Setting.findOne({ key: req.params.key });
            if (!setting) {
                return res.status(404).json({ success: false, message: "Setting not found" });
            }
            res.status(200).json({ success: true, data: setting });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching setting",
                error: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const setting = await Setting.create(req.body);

            res.status(201).json({
                success: true,
                message: "Setting created successfully",
                data: setting,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating setting",
                error: error.message,
            });
        }
    },

    updateByKey: async (req, res) => {
        try {
            const { value, type, group, description } = req.body;

            const setting = await Setting.findOneAndUpdate(
                { key: req.params.key },
                { value, type, group, description },
                { new: true, upsert: true, runValidators: true },
            );

            res.status(200).json({
                success: true,
                message: "Setting updated successfully",
                data: setting,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating setting",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            let setting = await Setting.findById(req.params.id);
            if (!setting) {
                return res.status(404).json({ success: false, message: "Setting not found" });
            }

            setting = await Setting.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            });

            res.status(200).json({
                success: true,
                message: "Setting updated successfully",
                data: setting,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating setting",
                error: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const setting = await Setting.findById(req.params.id);
            if (!setting) {
                return res.status(404).json({ success: false, message: "Setting not found" });
            }

            await Setting.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Setting deleted successfully" });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting setting",
                error: error.message,
            });
        }
    },
};
