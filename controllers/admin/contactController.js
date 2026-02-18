/** @format */

// ==================================================
// CONTACT MESSAGE CONTROLLER
// ==================================================
const ContactMessage = require("../../src/models/ContactMessage");

exports.contactController = {
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 20, status } = req.query;
            let query = {};

            if (status) query.status = status;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const total = await ContactMessage.countDocuments(query);

            const contacts = await ContactMessage.find(query).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(skip);

            res.status(200).json({
                success: true,
                data: contacts,
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
                message: "Error fetching contact messages",
                error: error.message,
            });
        }
    },

    getById: async (req, res) => {
        try {
            const contact = await ContactMessage.findById(req.params.id);
            if (!contact) {
                return res.status(404).json({ success: false, message: "Contact message not found" });
            }
            res.status(200).json({ success: true, data: contact });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching contact message",
                error: error.message,
            });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const contact = await ContactMessage.findByIdAndUpdate(req.params.id, { status: "read" }, { new: true });

            if (!contact) {
                return res.status(404).json({ success: false, message: "Contact message not found" });
            }

            res.status(200).json({
                success: true,
                message: "Message marked as read",
                data: contact,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error updating message status",
                error: error.message,
            });
        }
    },

    reply: async (req, res) => {
        try {
            const { replyMessage } = req.body;

            const contact = await ContactMessage.findByIdAndUpdate(
                req.params.id,
                {
                    status: "replied",
                    replyMessage,
                    repliedAt: new Date(),
                },
                { new: true },
            );

            if (!contact) {
                return res.status(404).json({ success: false, message: "Contact message not found" });
            }

            // TODO: Send email notification to user

            res.status(200).json({
                success: true,
                message: "Reply sent successfully",
                data: contact,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error sending reply",
                error: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const contact = await ContactMessage.findById(req.params.id);
            if (!contact) {
                return res.status(404).json({ success: false, message: "Contact message not found" });
            }

            await ContactMessage.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, message: "Contact message deleted successfully" });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error deleting contact message",
                error: error.message,
            });
        }
    },
};
