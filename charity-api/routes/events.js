/**
 * @module routes/events
 * @description RESTful router for the charity `event` resource.
 *
 * Exposes the full C.R.U.D. cycle:
 *  - GET    /api/events        list / search events
 *  - GET    /api/events/:id    single event with its registrations
 *  - POST   /api/events        create a new event (admin)
 *  - PUT    /api/events/:id    update an existing event (admin)
 *  - DELETE /api/events/:id    delete an event without registrations
 *
 * Every event row is enriched with its category name and hosting
 * charity name through SQL joins so that the front-ends do not need to
 * issue additional requests.
 */

const express = require('express');
const pool = require('../db');

/** Express router instance for /api/events. */
const router = express.Router();

/**
 * Allowed event status values, mirrored from the `chk_event_status`
 * database constraint.
 * @type {string[]}
 */
const ALLOWED_STATUS = ['Active', 'Past', 'Suspended'];

/**
 * Default venue coordinates (central Sydney) used when an event is
 * created or updated without explicit latitude/longitude. They
 * guarantee the optional Open-Meteo weather integration still has a
 * usable location instead of receiving NULL and showing no forecast.
 * @type {number}
 */
const DEFAULT_LATITUDE = -33.8688;
const DEFAULT_LONGITUDE = 151.2093;

/**
 * Coerces a submitted coordinate to a number, falling back to the
 * supplied default when the value is missing, blank or not a number.
 *
 * @param {*} value    - Raw latitude/longitude from the request body.
 * @param {number} fallback - Default coordinate used when invalid.
 * @returns {number} A usable coordinate value.
 */
function toCoordinate(value, fallback) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Shared column list for event queries. Every event is returned
 * together with its category and charity names.
 * @type {string}
 */
const EVENT_SELECT = `
  SELECT
    e.event_id,
    e.charity_id,
    e.category_id,
    e.name,
    e.description,
    e.event_date,
    e.location,
    e.purpose,
    e.ticket_price,
    e.goal_amount,
    e.current_amount,
    e.status,
    e.image,
    e.latitude,
    e.longitude,
    c.category_name,
    ch.charity_name,
    (SELECT COUNT(*) FROM registration r
      WHERE r.event_id = e.event_id) AS registration_count
  FROM \`event\` e
  INNER JOIN category c ON c.category_id = e.category_id
  INNER JOIN charity ch ON ch.charity_id = e.charity_id
`;

/**
 * Lists every charity event, optionally filtered by search criteria.
 *
 * @name ListEvents
 * @route {GET} /api/events
 * @query {string} [keyword]   - matches event name, description or purpose
 * @query {string} [location]  - partial match on the event location
 * @query {string} [category]  - exact category id
 * @query {string} [status]    - exact status (Active / Past / Suspended)
 * @returns {Object[]} Array of event objects ordered by date (newest first).
 */
router.get('/', async (req, res) => {
  const { keyword, location, category, status } = req.query;

  const clauses = [];
  const params = [];

  if (keyword) {
    clauses.push('(e.name LIKE ? OR e.description LIKE ? OR e.purpose LIKE ?)');
    const like = `%${keyword}%`;
    params.push(like, like, like);
  }

  if (location) {
    clauses.push('e.location LIKE ?');
    params.push(`%${location}%`);
  }

  if (category) {
    clauses.push('e.category_id = ?');
    params.push(category);
  }

  if (status) {
    clauses.push('e.status = ?');
    params.push(status);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  try {
    const sql = `${EVENT_SELECT} ${where} ORDER BY e.event_date DESC, e.event_id DESC`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('[events] list failed:', err.message);
    res.status(500).json({ error: 'Failed to retrieve events.', detail: err.message });
  }
});

/**
 * Retrieves a single charity event by its id, together with every
 * registration recorded for that event. Registrations are sorted by
 * the latest purchase date, as required by the event detail page.
 *
 * @name GetEventById
 * @route {GET} /api/events/:id
 * @param {number} id - Unique id of the event (`event_id`).
 * @returns {Object} The event object including a `registrations` array.
 * @throws {404} When no event exists for the given id.
 */
router.get('/:id', async (req, res) => {
  const eventId = Number(req.params.id);

  // A non-numeric id (e.g. a stray path segment) is a 404, not a SQL error.
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  try {
    const [eventRows] = await pool.query(
      `${EVENT_SELECT} WHERE e.event_id = ?`,
      [eventId]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Latest registrations first (required by the assessment brief).
    const [registrationRows] = await pool.query(
      `SELECT registration_id, event_id, full_name, email, phone,
              tickets, registration_date
         FROM registration
        WHERE event_id = ?
        ORDER BY registration_date DESC, registration_id DESC`,
      [eventId]
    );

    const event = eventRows[0];
    event.registrations = registrationRows;
    res.json(event);
  } catch (err) {
    console.error('[events] detail failed:', err.message);
    res.status(500).json({ error: 'Failed to retrieve the event.', detail: err.message });
  }
});

/**
 * Creates a new charity event (used by the admin website).
 *
 * @name CreateEvent
 * @route {POST} /api/events
 * @param {Object} body              - JSON request body.
 * @param {string} body.name         - Event name (required).
 * @param {string} body.event_date   - Event date as YYYY-MM-DD (required).
 * @param {string} body.location     - Event location (required).
 * @param {number} body.charity_id   - Hosting charity id (required).
 * @param {number} body.category_id  - Event category id (required).
 * @param {number} body.ticket_price - Ticket price (required, >= 0).
 * @param {string} [body.status]     - Active (default), Past or Suspended.
 * @returns {Object} The id of the newly created event.
 * @throws {400} When required fields are missing or invalid.
 */
router.post('/', async (req, res) => {
  const b = req.body || {};

  const validationError = validateEventBody(b);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const status = ALLOWED_STATUS.includes(b.status) ? b.status : 'Active';

  try {
    const [result] = await pool.query(
      `INSERT INTO \`event\`
        (charity_id, category_id, name, description, event_date, location,
         purpose, ticket_price, goal_amount, current_amount, status,
         image, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.charity_id,
        b.category_id,
        String(b.name).trim(),
        b.description ?? null,
        b.event_date,
        String(b.location).trim(),
        b.purpose ?? null,
        b.ticket_price,
        b.goal_amount ?? null,
        b.current_amount ?? 0,
        status,
        b.image ?? null,
        toCoordinate(b.latitude, DEFAULT_LATITUDE),
        toCoordinate(b.longitude, DEFAULT_LONGITUDE)
      ]
    );

    res.status(201).json({
      event_id: result.insertId,
      message: 'Event created successfully.'
    });
  } catch (err) {
    console.error('[events] create failed:', err.message);
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid charity or category id.' });
    }
    res.status(500).json({ error: 'Failed to create the event.', detail: err.message });
  }
});

/**
 * Updates an existing charity event (used by the admin website).
 *
 * @name UpdateEvent
 * @route {PUT} /api/events/:id
 * @param {number} id - Unique id of the event to update.
 * @param {Object} body - Full set of editable event fields.
 * @returns {Object} Confirmation message.
 * @throws {404} When the event does not exist.
 * @throws {400} When required fields are missing or invalid.
 */
router.put('/:id', async (req, res) => {
  const eventId = Number(req.params.id);
  const b = req.body || {};

  const validationError = validateEventBody(b);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  if (!ALLOWED_STATUS.includes(b.status)) {
    return res.status(400).json({
      error: `Status must be one of: ${ALLOWED_STATUS.join(', ')}.`
    });
  }

  try {
    const [existing] = await pool.query(
      'SELECT event_id FROM `event` WHERE event_id = ?',
      [eventId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    await pool.query(
      `UPDATE \`event\` SET
         charity_id = ?,
         category_id = ?,
         name = ?,
         description = ?,
         event_date = ?,
         location = ?,
         purpose = ?,
         ticket_price = ?,
         goal_amount = ?,
         current_amount = ?,
         status = ?,
         image = ?,
         latitude = ?,
         longitude = ?
       WHERE event_id = ?`,
      [
        b.charity_id,
        b.category_id,
        String(b.name).trim(),
        b.description ?? null,
        b.event_date,
        String(b.location).trim(),
        b.purpose ?? null,
        b.ticket_price,
        b.goal_amount ?? null,
        b.current_amount ?? 0,
        b.status,
        b.image ?? null,
        toCoordinate(b.latitude, DEFAULT_LATITUDE),
        toCoordinate(b.longitude, DEFAULT_LONGITUDE),
        eventId
      ]
    );

    res.json({ event_id: eventId, message: 'Event updated successfully.' });
  } catch (err) {
    console.error('[events] update failed:', err.message);
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid charity or category id.' });
    }
    res.status(500).json({ error: 'Failed to update the event.', detail: err.message });
  }
});

/**
 * Deletes an event while upholding referential integrity.
 *
 * Deletion is blocked whenever at least one registration references
 * the event, because the foreign key is declared with
 * `ON DELETE RESTRICT`. A descriptive 409 response is returned so the
 * admin website can explain why the operation failed.
 *
 * @name DeleteEvent
 * @route {DELETE} /api/events/:id
 * @param {number} id - Unique id of the event to delete.
 * @returns {Object} Confirmation message.
 * @throws {409} When the event still has registrations.
 * @throws {404} When the event does not exist.
 */
router.delete('/:id', async (req, res) => {
  const eventId = Number(req.params.id);

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  try {
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS registration_count FROM registration WHERE event_id = ?',
      [eventId]
    );

    if (countRows[0].registration_count > 0) {
      return res.status(409).json({
        error: 'This event cannot be deleted because it already has registrations.',
        registration_count: countRows[0].registration_count
      });
    }

    const [result] = await pool.query(
      'DELETE FROM `event` WHERE event_id = ?',
      [eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json({ event_id: eventId, message: 'Event deleted successfully.' });
  } catch (err) {
    console.error('[events] delete failed:', err.message);
    res.status(500).json({ error: 'Failed to delete the event.', detail: err.message });
  }
});

/**
 * Validates the event fields submitted by the admin forms.
 *
 * @param {Object} b - The request body to validate.
 * @returns {string|null} An error message when validation fails,
 *                        otherwise `null`.
 */
function validateEventBody(b) {
  if (!b.name || !String(b.name).trim()) {
    return 'Event name is required.';
  }
  if (!b.event_date) {
    return 'Event date is required.';
  }
  if (!b.location || !String(b.location).trim()) {
    return 'Event location is required.';
  }
  if (!b.charity_id) {
    return 'Hosting charity is required.';
  }
  if (!b.category_id) {
    return 'Event category is required.';
  }
  if (b.ticket_price === undefined || b.ticket_price === '' ||
      Number(b.ticket_price) < 0) {
    return 'Ticket price must be zero or a positive number.';
  }
  if (b.goal_amount !== undefined && b.goal_amount !== null &&
      b.goal_amount !== '' && Number(b.goal_amount) < 0) {
    return 'Goal amount cannot be negative.';
  }
  if (b.current_amount !== undefined && b.current_amount !== null &&
      b.current_amount !== '' && Number(b.current_amount) < 0) {
    return 'Current amount cannot be negative.';
  }
  return null;
}

module.exports = router;
