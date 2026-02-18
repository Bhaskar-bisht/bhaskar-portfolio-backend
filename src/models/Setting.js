/** @format */

const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: [true, "Setting key is required"],
            unique: true,
            trim: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, "Setting value is required"],
        },
        type: {
            type: String,
            enum: ["string", "number", "boolean", "json", "array"],
            default: "string",
        },
        group: {
            type: String,
            enum: ["general", "seo", "email", "social", "analytics", "other"],
            default: "general",
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

// Static method to get setting value
settingSchema.statics.getValue = async function (key, defaultValue = null) {
    const setting = await this.findOne({ key });
    return setting ? setting.value : defaultValue;
};

// Static method to set setting value
settingSchema.statics.setValue = async function (key, value, type = "string", group = "general") {
    return await this.findOneAndUpdate({ key }, { value, type, group }, { upsert: true, new: true });
};

module.exports = mongoose.model("Setting", settingSchema);
