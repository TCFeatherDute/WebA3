/**
 * @module routes/categories
 * @description Read-only router for the event `category` resource.
 *
 * Categories are used to populate the filter dropdown on the
 * client-side search page and the category dropdown on the admin
 * event forms.
 *
 *  - GET /api/categories
 */

const express = require('express');
const pool = require('../event_db');

/** Express router instance for /api/categories. */
const router = express.Router();

/**
 * Lists all event categories ordered alphabetically by name.
 *
 * @name ListCategories
 * @route {GET} /api/categories
 * @returns {Object[]} Array of category objects
 *                    (`category_id`, `category_name`, `description`).
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT category_id, category_name, description FROM category ORDER BY category_name'
    );
    res.json(rows);
  } catch (err) {
    console.error('[categories] list failed:', err.message);
    res.status(500).json({ error: 'Failed to retrieve categories.', detail: err.message });
  }
});

module.exports = router;
