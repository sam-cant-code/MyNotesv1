import { pool } from "../config/postgres.js";

/**
 * Ensures the 'users' table exists in the database.
 * This function uses "CREATE TABLE IF NOT EXISTS" which is safe to run every time the server starts.
 */
export const ensureUsersTableExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id VARCHAR(255) UNIQUE NOT NULL,
      display_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("✅ 'users' table is ready.");
  } catch (err) {
    console.error("❌ Error ensuring 'users' table exists:", err);
    process.exit(1); // Exit if the table can't be created, as the app can't run without it.
  }
};

// A model is a collection of functions that interact directly with the database.
// This keeps your database logic separate from your authentication strategy.

/**
 * Finds a user by their unique Google ID.
 * @param {string} googleId - The user's Google profile ID.
 * @returns {Promise<object|null>} The user object if found, otherwise null.
 */
export const findByGoogleId = async (googleId) => {
  const query = "SELECT * FROM users WHERE google_id = $1";
  const { rows } = await pool.query(query, [googleId]);
  return rows[0] || null; // Return the first user found or null
};

/**
 * Creates a new user in the database.
 * @param {object} userDetails - The details of the user to create.
 * @param {string} userDetails.googleId - The user's Google ID.
 * @param {string} userDetails.displayName - The user's display name.
 * @param {string} userDetails.email - The user's email address.
 * @returns {Promise<object>} The newly created user object.
 */
export const createUser = async ({ googleId, displayName, email }) => {
  const query =
    "INSERT INTO users (google_id, display_name, email) VALUES ($1, $2, $3) RETURNING *";
  const { rows } = await pool.query(query, [googleId, displayName, email]);
  return rows[0];
};

