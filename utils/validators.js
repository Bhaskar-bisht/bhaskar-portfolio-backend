/** @format */

const { body, param, query, validationResult } = require("express-validator");

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }
    next();
};

/**
 * Common validation rules
 */
const validations = {
    // Email validation
    email: body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),

    // Password validation
    password: body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

    // MongoDB ObjectId validation
    objectId: (field = "id") => param(field).isMongoId().withMessage(`Invalid ${field} format`),

    // String validation
    string: (field, min = 1, max = 500) =>
        body(field).trim().isLength({ min, max }).withMessage(`${field} must be between ${min} and ${max} characters`),

    // Optional string validation
    optionalString: (field, max = 500) =>
        body(field).optional().trim().isLength({ max }).withMessage(`${field} must not exceed ${max} characters`),

    // URL validation
    url: (field) => body(field).optional().isURL().withMessage(`${field} must be a valid URL`),

    // Number validation
    number: (field, min = 0) =>
        body(field)
            .isNumeric()
            .withMessage(`${field} must be a number`)
            .custom((value) => value >= min)
            .withMessage(`${field} must be at least ${min}`),

    // Boolean validation
    boolean: (field) => body(field).optional().isBoolean().withMessage(`${field} must be a boolean`),

    // Date validation
    date: (field) => body(field).optional().isISO8601().withMessage(`${field} must be a valid date`),

    // Array validation
    array: (field) => body(field).optional().isArray().withMessage(`${field} must be an array`),

    // Enum validation
    enum: (field, values) =>
        body(field)
            .isIn(values)
            .withMessage(`${field} must be one of: ${values.join(", ")}`),
};

module.exports = {
    handleValidationErrors,
    validations,
    body,
    param,
    query,
};
