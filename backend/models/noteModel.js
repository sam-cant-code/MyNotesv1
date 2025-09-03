// Enhanced debugging version of your noteModel.js
import { pool } from "../config/postgres.js";

/**
 * Ensures the 'notes' table exists in the database.
 * This function uses "CREATE TABLE IF NOT EXISTS" which is safe to run on every startup.
 */
export const ensureNotesTableExists = async () => {
  console.log("🔄 Starting notes table creation process...");
  
  try {
    // First, let's verify the database connection is working
    console.log("🔍 Testing database connection...");
    const testResult = await pool.query("SELECT NOW()");
    console.log("✅ Database connection test successful:", testResult.rows[0]);

    // Check if users table exists first
    console.log("🔍 Checking if users table exists...");
    const usersCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    console.log("Users table exists:", usersCheck.rows[0].exists);
    
    if (!usersCheck.rows[0].exists) {
      throw new Error("Users table does not exist! Cannot create notes table with foreign key constraint.");
    }

    // Check if notes table already exists
    console.log("🔍 Checking if notes table already exists...");
    const notesCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
      );
    `);
    console.log("Notes table already exists:", notesCheck.rows[0].exists);

    // Create the notes table
    console.log("🔄 Creating notes table...");
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user
            FOREIGN KEY(user_id) 
            REFERENCES users(id)
            ON DELETE CASCADE
      );
    `;
    
    const result = await pool.query(createTableQuery);
    console.log("✅ Notes table creation query executed successfully");

    // Verify the table was created
    console.log("🔍 Verifying notes table was created...");
    const finalCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
      );
    `);
    console.log("Notes table exists after creation:", finalCheck.rows[0].exists);

    // List all columns in the notes table
    console.log("🔍 Checking notes table structure...");
    const columnsCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notes' 
      ORDER BY ordinal_position;
    `);
    console.log("Notes table columns:", columnsCheck.rows);

    console.log("✅ 'notes' table is ready and verified.");
    
  } catch (err) {
    console.error("❌ Error ensuring 'notes' table exists:", err);
    console.error("Full error details:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      position: err.position,
      internalPosition: err.internalPosition,
      internalQuery: err.internalQuery,
      where: err.where,
      schema: err.schema,
      table: err.table,
      column: err.column,
      dataType: err.dataType,
      constraint: err.constraint
    });
    throw err; // Re-throw to stop server startup
  }
};

/**
 * Finds all notes for a given user ID.
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Array>} An array of the user's notes.
 */
export const findNotesByUserId = async (userId) => {
  console.log(`🔍 Attempting to find notes for user ID: ${userId}`);
  
  try {
    // First verify the table exists before querying
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      throw new Error("Notes table does not exist when trying to query it!");
    }
    
    console.log("✅ Notes table confirmed to exist before query");
    
    const query = "SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC";
    console.log("🔄 Executing query:", query, "with userId:", userId);
    
    const { rows } = await pool.query(query, [userId]);
    console.log(`✅ Query successful. Found ${rows.length} notes for user ${userId}`);
    
    return rows;
  } catch (err) {
    console.error("❌ Error in findNotesByUserId:", err);
    console.error("Full error details:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint
    });
    throw err;
  }
};

/**
 * Creates a new note in the database for a specific user.
 * @param {object} noteDetails - The details of the note to create.
 * @param {number} noteDetails.userId - The ID of the user creating the note.
 * @param {string} noteDetails.title - The title of the note.
 * @param {string} noteDetails.content - The content of the note.
 * @returns {Promise<object>} The newly created note object.
 */
export const createNoteForUser = async ({ userId, title, content }) => {
  console.log(`🔍 Attempting to create note for user ID: ${userId}`);
  console.log("Note details:", { userId, title: title?.substring(0, 50), content: content?.substring(0, 100) });
  
  try {
    // First verify the table exists before querying
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      throw new Error("Notes table does not exist when trying to insert!");
    }
    
    console.log("✅ Notes table confirmed to exist before insert");
    
    const query = "INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *";
    console.log("🔄 Executing insert query:", query);
    
    const { rows } = await pool.query(query, [userId, title, content]);
    console.log("✅ Note created successfully:", rows[0]);
    
    return rows[0];
  } catch (err) {
    console.error("❌ Error in createNoteForUser:", err);
    console.error("Full error details:", {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint
    });
    throw err;
  }
};

// Additional debugging function to check database state
export const debugDatabaseState = async () => {
  try {
    console.log("🔍 === DATABASE STATE DEBUG ===");
    
    // List all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log("All tables in database:", tables.rows.map(row => row.table_name));
    
    // Check current database name
    const dbName = await pool.query("SELECT current_database()");
    console.log("Current database:", dbName.rows[0].current_database);
    
    // Check current schema
    const currentSchema = await pool.query("SELECT current_schema()");
    console.log("Current schema:", currentSchema.rows[0].current_schema);
    
    console.log("=== END DATABASE STATE DEBUG ===");
  } catch (err) {
    console.error("❌ Error in debugDatabaseState:", err);
  }
};