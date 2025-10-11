
import { pool } from "../config/postgres.js";

export const ensureNotesTableExists = async () => {
  console.log("🔄 Starting notes table creation process...");
  
  try {
    console.log("🔍 Testing database connection...");
    const testResult = await pool.query("SELECT NOW()");
    console.log("✅ Database connection test successful:", testResult.rows[0]);

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
      throw new Error("Users table does not exist!");
    }

    console.log("🔄 Creating notes table...");
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user
            FOREIGN KEY(user_id) 
            REFERENCES users(id)
            ON DELETE CASCADE
      );
    `;
    
    await pool.query(createTableQuery);
    console.log("✅ Notes table created successfully");

    console.log("🔄 Ensuring pinned column exists...");
    const addPinnedColumn = `
      DO $$ 
      BEGIN 
        BEGIN
          ALTER TABLE notes ADD COLUMN pinned BOOLEAN DEFAULT FALSE;
        EXCEPTION
          WHEN duplicate_column THEN 
            NULL;
        END;
      END $$;
    `;
    await pool.query(addPinnedColumn);
    console.log("✅ Pinned column ensured");

    console.log("✅ Notes table is ready and verified");
    
  } catch (err) {
    console.error("❌ Error ensuring notes table exists:", err);
    throw err;
  }
};

export const findNotesByUserId = async (userId) => {
  console.log(`🔍 Finding notes for user ID: ${userId}`);
  
  try {
    const query = "SELECT * FROM notes WHERE user_id = $1 ORDER BY pinned DESC, created_at DESC";
    const { rows } = await pool.query(query, [userId]);
    console.log(`✅ Found ${rows.length} notes`);
    return rows;
  } catch (err) {
    console.error("❌ Error in findNotesByUserId:", err);
    throw err;
  }
};

export const createNoteForUser = async ({ userId, title, content }) => {
  console.log(`🔍 Creating note for user ID: ${userId}`);
  
  try {
    const query = "INSERT INTO notes (user_id, title, content, pinned) VALUES ($1, $2, $3, $4) RETURNING *";
    const { rows } = await pool.query(query, [userId, title, content, false]);
    console.log("✅ Note created successfully");
    return rows[0];
  } catch (err) {
    console.error("❌ Error in createNoteForUser:", err);
    throw err;
  }
};

export const updateNoteById = async (noteId, userId, { title, content }) => {
  const query = "UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *";
  const { rows } = await pool.query(query, [title, content, noteId, userId]);
  return rows[0] || null;
};

export const deleteNoteById = async (noteId, userId) => {
  const query = "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *";
  const { rows } = await pool.query(query, [noteId, userId]);
  return rows[0] || null;
};

export const togglePinNote = async (noteId, userId) => {
  const query = "UPDATE notes SET pinned = NOT pinned WHERE id = $1 AND user_id = $2 RETURNING *";
  const { rows } = await pool.query(query, [noteId, userId]);
  return rows[0] || null;
};