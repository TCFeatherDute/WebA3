/**
 * @module routes/registrations
 * @description RESTful router for the event `registration` resource.
 *
 * Endpoints:
 *  - POST   /api/registrations       create a registration (public site)
 *  - PUT    /api/registrations/:id   update an existing registration (admin)
 *  - DELETE /api/registrations/:id   remove an existing registration (admin)
 *
 * The database enforces a unique key `uk_event_email(event_id, email)`
 * so that the same email can only register once for a given event.
 *
 * Although the brief does not require registration edit/delete
 * endpoints ("you may do it if you want"), they are provided so the
 * admin website can fully manage booking records.
 */

const express = require('express');
const pool = require('../db');

/** Express router instance for /api/registrations. */
const router = express.Router();

/**
 * Basic email format validation pattern.
 * @type {RegExp}
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates the attendee fields shared by the create and update routes.
 *
 * @param {Object} body - JSON request body to validate.
 * @returns {string|null} An error message when validation fails,
 *                        otherwise `null`.
 */
function validateRegistrationBody(body) {
  const { full_name, email, phone, tickets } = body || {};

  if (!full_name || !String(full_name).trim()) {
    return 'Full name is required.';
  }
  if (!email || !EMAIL_PATTERN.test(String(email).trim())) {
    return 'A valid email address is required.';
  }
  if (!phone || !String(phone).trim()) {
    return 'Phone number is required.';
  }
  const ticketCount = Number(tickets);
  if (!Number.isInteger(ticketCount) || ticketCount < 1) {
    return 'At least one ticket must be purchased.';
  }
  return null;
}

/**
 * Creates a new registration for an event.
 *
 * @name CreateRegistration
 * @route {POST /api/registrations}
 * @param {Object} body            - JSON request body.
 * @param {number} body.event_id   - Event being registered for (required).
 * @param {string} body.full_name  - Attendee full name (required).
 * @param {string} body.email      - Attendee email (required, unique per event).
 * @param {string} body.phone      - Contact phone number (required).
 * @param {number} body.tickets    - Number of tickets (required, >= 1).
 * @returns {Object} The id of the new registration and a confirmation.
 * @throws {400} Validation failure, duplicate registration or bad email.
 * @throws {404} When the referenced event does not exist.
 */
router.post('/', async (req, res) => {
  const { event_id, full_name, email, phone, tickets } = req.body || {};

  if (!event_id) {
    return res.status(400).json({ error: 'An event must be selected.' });
  }
  const validationError = validateRegistrationBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const ticketCount = Number(tickets);

  try {
    // Make sure the event exists before inserting the registration.
    const [eventRows] = await pool.query(
      'SELECT event_id FROM `event` WHERE event_id = ?',
      [event_id]
    );
    if (eventRows.length === 0) {
      return res.status(404).json({ error: 'The selected event does not exist.' });
    }

    const [result] = await pool.query(
      `INSERT INTO registration
        (event_id, full_name, email, phone, tickets)
       VALUES (?, ?, ?, ?, ?)`,
      [event_id, String(full_name).trim(), String(email).trim(),
       String(phone).trim(), ticketCount]
    );

    res.status(201).json({
      registration_id: result.insertId,
      message: 'Your registration has been submitted successfully.'
    });
  } catch (err) {
    console.error('[registrations] create failed:', err.message);

    // Duplicate unique key (event_id, email) - already registered.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'This email has already been used to register for the selected event.'
      });
    }

    res.status(500).json({
      error: 'Failed to submit the registration.',
      detail: err.message
    });
  }
});

/**
 * Updates an existing registration's attendee details and ticket count.
 *
 * The linked event (`event_id`) cannot be changed here: a booking
 * always belongs to the event it was created for, so the route keeps
 * the original event id and only edits the attendee fields.
 *
 * @name UpdateRegistration
 * @route {PUT /api/registrations/:id}
 * @param {number} id - Unique id of the registration (`registration_id`).
 * @param {Object} body           - JSON request body.
 * @param {string} body.full_name - Attendee full name (required).
 * @param {string} body.email     - Attendee email (required, unique per event).
 * @param {string} body.phone     - Contact phone number (required).
 * @param {number} body.tickets   - Number of tickets (required, >= 1).
 * @returns {Object} Confirmation message.
 * @throws {404} When the registration does not exist.
 * @throws {400} When the submitted fields are invalid.
 * @throws {409} When the new email duplicates another booking for the event.
 */
router.put('/:id', async (req, res) => {
  const registrationId = Number(req.params.id);

  if (!Number.isInteger(registrationId) || registrationId <= 0) {
    return res.status(404).json({ error: 'Registration not found.' });
  }

  const validationError = validateRegistrationBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { full_name, email, phone } = req.body;
  const ticketCount = Number(req.body.tickets);

  try {
    // Keep the original event id; the event link is not editable.
    const [existingRows] = await pool.query(
      'SELECT event_id FROM registration WHERE registration_id = ?',
      [registrationId]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    await pool.query(
      `UPDATE registration
          SET full_name = ?, email = ?, phone = ?, tickets = ?
        WHERE registration_id = ?`,
      [
        String(full_name).trim(),
        String(email).trim(),
        String(phone).trim(),
        ticketCount,
        registrationId
      ]
    );

    res.json({
      registration_id: registrationId,
      message: 'Registration updated successfully.'
    });
  } catch (err) {
    console.error('[registrations] update failed:', err.message);

    // Email changed to one already registered for the same event.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'This email is already registered for the selected event.'
      });
    }

    res.status(500).json({
      error: 'Failed to update the registration.',
      detail: err.message
    });
  }
});

/**
 * Deletes a single registration.
 *
 * Deleting a booking is always safe because the `registration` row is
 * the child side of the foreign key; it does not reference any other
 * child table. The event itself is left untouched.
 *
 * @name DeleteRegistration
 * @route {DELETE /api/registrations/:id}
 * @param {number} id - Unique id of the registration (`registration_id`).
 * @returns {Object} Confirmation message.
 * @throws {404} When the registration does not exist.
 */
router.delete('/:id', async (req, res) => {
  const registrationId = Number(req.params.id);

  if (!Number.isInteger(registrationId) || registrationId <= 0) {
    return res.status(404).json({ error: 'Registration not found.' });
  }

  try {
    const [result] = await pool.query(
      'DELETE FROM registration WHERE registration_id = ?',
      [registrationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    res.json({
      registration_id: registrationId,
      message: 'Registration deleted successfully.'
    });
  } catch (err) {
    console.error('[registrations] delete failed:', err.message);
    res.status(500).json({
      error: 'Failed to delete the registration.',
      detail: err.message
    });
  }
});

module.exports = router;
