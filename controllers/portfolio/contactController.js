/** @format */

const ContactMessage = require("../../src/models/ContactMessage");
const nodemailer = require("nodemailer");

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

// @desc    Submit contact form
// @route   POST /api/portfolio/contact
// @access  Public
exports.submit = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        // Email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address",
            });
        }

        // Save contact message
        const contactMessage = await ContactMessage.create({
            name,
            email,
            phone,
            subject,
            message,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get("user-agent"),
            status: "new",
        });

        // Send confirmation email to customer
        try {
            const transporter = createTransporter();

            // Email to customer
            await transporter.sendMail({
                from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
                to: email,
                subject: "Thank you for contacting me!",
                html: `
          <h2>Hi ${name},</h2>
          <p>Thank you for reaching out! I've received your message and will get back to you as soon as possible.</p>
          <h3>Your Message:</h3>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong> ${message}</p>
          <br>
          <p>Best regards,<br>${process.env.FROM_NAME}</p>
        `,
            });

            // Notification email to admin
            await transporter.sendMail({
                from: `"Portfolio Contact Form" <${process.env.FROM_EMAIL}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `New Contact Form Submission: ${subject}`,
                html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <br>
          <p><strong>IP Address:</strong> ${contactMessage.ipAddress}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        `,
            });
        } catch (emailError) {
            console.error("Email sending error:", emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            success: true,
            message: "Thank you for contacting me! I will get back to you soon.",
            data: {
                id: contactMessage._id,
                name: contactMessage.name,
                email: contactMessage.email,
            },
        });
    } catch (error) {
        console.error("Contact form error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again later.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

// @desc    Get contact information
// @route   GET /api/portfolio/contact/info
// @access  Public
exports.getContactInfo = async (req, res) => {
    try {
        const User = require("../../models/User");
        const user = await User.findOne().select(
            "email location timezone availabilityStatus githubUrl linkedinUrl twitterUrl",
        );

        const contactInfo = {
            email: user?.email || process.env.ADMIN_EMAIL,
            location: user?.location || "Delhi, India",
            timezone: user?.timezone || "Asia/Kolkata",
            availability: user?.availabilityStatus || "available",
            github: user?.githubUrl,
            linkedin: user?.linkedinUrl,
            twitter: user?.twitterUrl,
        };

        res.status(200).json({
            success: true,
            data: contactInfo,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch contact information",
            error: error.message,
        });
    }
};
