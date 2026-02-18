/**
 * Generate URL-friendly slug from string
 *
 * @format
 * @param {String} text - Text to slugify
 * @returns {String} - Slugified text
 */

const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
};

/**
 * Generate unique slug by appending number if duplicate exists
 * @param {String} text - Text to slugify
 * @param {Model} model - Mongoose model to check for duplicates
 * @param {String} id - Current document ID (for updates)
 * @returns {Promise<String>} - Unique slug
 */
const generateUniqueSlug = async (text, model, id = null) => {
    let slug = generateSlug(text);
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
        const query = id ? { slug: uniqueSlug, _id: { $ne: id } } : { slug: uniqueSlug };
        const existing = await model.findOne(query);

        if (!existing) {
            break;
        }

        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }

    return uniqueSlug;
};

module.exports = {
    generateSlug,
    generateUniqueSlug,
};
