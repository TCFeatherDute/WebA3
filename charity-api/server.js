/**
 * @file server.js
 * @description Entry point of the charity events RESTful API.
 *
 * The file creates the Express application, registers the global
 * middleware (CORS, JSON body parsing), mounts every resource router
 * and starts listening on the port defined in the environment file.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const eventRouter = require('./routes/events');
const registrationRouter = require('./routes/registrations');
const categoryRouter = require('./routes/categories');
const charityRouter = require('./routes/charities');

/** Express application instance. */
const app = express();
/** Port the HTTP server listens on. */
const PORT = process.env.PORT || 3000;

/* ----------------------------------
 * Global middleware
 * ---------------------------------- */

// Allow the Angular client and admin front-ends to call the API
// from a different origin during local development.
app.use(cors());

// Parse JSON request bodies (used by POST and PUT endpoints).
app.use(express.json());

/* ----------------------------------
 * Resource routers
 * ---------------------------------- */

app.use('/api/events', eventRouter);
app.use('/api/registrations', registrationRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/charities', charityRouter);

/**
 * Liveness / health-check endpoint.
 *
 * @name GetApiHealth
 * @route {GET} /api/health
 * @returns {Object} JSON object containing the service status and the
 *                   current server timestamp.
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Charity Events API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Fallback handler for unmatched API routes.
 *
 * Express 5 / path-to-regexp v8 no longer supports an unnamed `*`
 * wildcard, so a final path-less middleware is used: every request
 * that reached this point without matching a route is a 404.
 *
 * @name ApiNotFound
 * @returns {Object} Standardised 404 error response.
 */
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

/* ----------------------------------
 * Start the server
 * ---------------------------------- */

/**
 * Starts the HTTP server and performs a one-off database connectivity
 * check so that misconfigured database credentials are reported
 * immediately in the console.
 */
async function start() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('[db] Database connection successful.');
  } catch (err) {
    console.error('[db] Unable to connect to the database:');
    console.error(`     ${err.message}`);
    console.error('     Check the credentials in the .env file and that MySQL is running.');
  }

  app.listen(PORT, () => {
    console.log(`[server] Charity Events API listening on http://localhost:${PORT}`);
    console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
  });
}

start();
