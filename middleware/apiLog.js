/** @format */

// const ApiLog = require("../models/ApiLog");
const ApiLog = require("../src/models/ApiLog");

// ✅ IMPROVED: Get real client IP (works with proxies)
const getClientIp = (req) => {
    // Check common proxy headers (in order of priority)
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        // x-forwarded-for can be: "client, proxy1, proxy2"
        return forwarded.split(",")[0].trim();
    }

    // Cloudflare
    if (req.headers["cf-connecting-ip"]) {
        return req.headers["cf-connecting-ip"];
    }

    // Other proxies
    if (req.headers["x-real-ip"]) {
        return req.headers["x-real-ip"];
    }

    // Direct connection (localhost)
    return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || "Unknown";
};

// Helper to sanitize sensitive data
const sanitizeData = (data) => {
    if (!data) return null;

    const sensitiveFields = ["password", "token", "secret", "authorization"];
    const sanitized = JSON.parse(JSON.stringify(data));

    const removeSensitive = (obj) => {
        if (typeof obj !== "object" || obj === null) return;

        Object.keys(obj).forEach((key) => {
            if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
                obj[key] = "[REDACTED]";
            } else if (typeof obj[key] === "object") {
                removeSensitive(obj[key]);
            }
        });
    };

    removeSensitive(sanitized);
    return sanitized;
};

const apiLogger = async (req, res, next) => {
    const startTime = Date.now();

    // Store original response methods
    const originalJson = res.json;
    const originalSend = res.send;

    let responseBody = null;

    // Override res.json to capture response
    res.json = function (data) {
        responseBody = data;
        return originalJson.call(this, data);
    };

    // Override res.send to capture response
    res.send = function (data) {
        if (!responseBody) {
            try {
                responseBody = typeof data === "string" ? JSON.parse(data) : data;
            } catch (e) {
                responseBody = data;
            }
        }
        return originalSend.call(this, data);
    };

    // Log after response is sent
    res.on("finish", async () => {
        try {
            const responseTime = Date.now() - startTime;

            const logData = {
                method: req.method,
                path: req.path,
                fullUrl: req.originalUrl,
                statusCode: res.statusCode,
                responseTime,
                ipAddress: getClientIp(req),
                userAgent: req.headers["user-agent"] || "Unknown",
                origin: req.headers.origin || req.headers.referer || "Direct",
                referer: req.headers.referer,
                requestHeaders: sanitizeData(req.headers),
                requestBody: sanitizeData(req.body),
                requestQuery: sanitizeData(req.query),
                responseBody: sanitizeData(responseBody),
                timestamp: new Date(),
            };

            // Save log asynchronously (don't block response)
            await ApiLog.create(logData);
        } catch (error) {
            console.error("Error logging API request:", error);
        }
    });

    next();
};

module.exports = apiLogger;
