/**
 * @file config.ts
 * @description Central configuration for the admin application.
 *
 * The admin website talks to the same Node.js / Express RESTful API
 * as the public client website. Keeping the base URL in one constant
 * makes switching between local development (port 3000) and the SCU
 * cPanel deployment a one-line change.
 */

/**
 * Base URL of the charity events RESTful API.
 *
 * - Local development: the Node.js / Express server runs on port 3000.
 * - cPanel deployment: replace this value with the deployed API URL.
 */
export const API_BASE_URL = 'http://localhost:3000/api';
