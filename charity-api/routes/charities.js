/**
 * @module routes/charities
 * @description Read-only router for the `charity` resource.
 *
 * Charities are used to populate the hosting-charity dropdown on the
 * admin event create/update forms.
 *
 *  - GET /api/charities
 */

const express = require('express');
const pool = require('../db');

/** Express router instance for /api/charities. */
const router = express.Router();

/**
 * Lists all registered charities ordered alphabetically by name.
 *
 * @name ListCharities
 * @route {GET} /api/charities
 * @returns {Object[]} Array of charity objects
 *                    (`charity_id`, `charity_name`, `contact_email`,
 *                    `contact_phone`, `description`).
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT charity_id, charity_name, contact_email,
              contact_phone, description
         FROM charity
        ORDER BY charity_name`
    );
    res.json(rows);
  } catch (err) {
    console.error('[charities] list failed:', err.message);
    res.status(500).json({ error: 'Failed to retrieve charities.', detail: err.message });
  }
});

module.exports = router;
