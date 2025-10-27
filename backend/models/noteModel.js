import { pool } from "../config/postgres.js";

// --- NEW TABLE FUNCTIONS ---

export const ensureTagsTableExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_user
          FOREIGN KEY(user_id) 
          REFERENCES users(id)
          ON DELETE CASCADE,
      CONSTRAINT uq_user_tag_name
          UNIQUE (user_id, name)
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("✅ 'tags' table is ready.");
  } catch (err) {
    console.error("❌ Error ensuring 'tags' table exists:", err);
    process.exit(1);
  }
};

export const ensureNoteTagsTableExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS note_tags (
      note_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      CONSTRAINT fk_note
          FOREIGN KEY(note_id) 
          REFERENCES notes(id)
          ON DELETE CASCADE,
      CONSTRAINT fk_tag
          FOREIGN KEY(tag_id) 
          REFERENCES tags(id)
          ON DELETE CASCADE,
      PRIMARY KEY (note_id, tag_id)
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("✅ 'note_tags' table is ready.");
  } catch (err) {
    console.error("❌ Error ensuring 'note_tags' table exists:", err);
    process.exit(1);
  }
};

// --- UPDATED: ensureNotesTableExists ---
// Added `updated_at` column and an auto-update trigger
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
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- <-- NEW COLUMN
        CONSTRAINT fk_user
            FOREIGN KEY(user_id) 
            REFERENCES users(id)
            ON DELETE CASCADE
      );
    `;
    
    await pool.query(createTableQuery);
    console.log("✅ Notes table created successfully");

    // --- (Keep existing pinned column check) ---
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

    // --- (Ensure updated_at column exists on old tables) ---
    console.log("🔄 Ensuring updated_at column exists...");
    const addUpdatedAtColumn = `
      DO $$ 
      BEGIN 
        BEGIN
          ALTER TABLE notes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        EXCEPTION
          WHEN duplicate_column THEN 
            NULL;
        END;
      END $$;
    `;
    await pool.query(addUpdatedAtColumn);
    console.log("✅ updated_at column ensured");
    
    // --- (Create function to auto-update updated_at) ---
    console.log("🔄 Creating/Updating timestamp trigger function...");
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = CURRENT_TIMESTAMP;
         RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    await pool.query(createFunctionQuery);
    
    // --- (Apply trigger to notes table) ---
    console.log("🔄 Applying timestamp trigger to 'notes' table...");
    const createTriggerQuery = `
      DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
      CREATE TRIGGER update_notes_updated_at
      BEFORE UPDATE ON notes
      FOR EACH ROW
      EXECUTE PROCEDURE update_updated_at_column();
    `;
    await pool.query(createTriggerQuery);
    console.log("✅ Timestamp trigger applied");

    console.log("✅ Notes table is ready and verified");
    
  } catch (err) {
    console.error("❌ Error ensuring notes table exists:", err);
    throw err;
  }
};
// --- (End of updated ensureNotesTableExists) ---


// --- NEW HELPER: findOrCreateTags ---
// This function takes an array of tag names, finds existing ones,
// and creates any that are missing. It returns an array of tag IDs.
const findOrCreateTags = async (userId, tagNames) => {
  if (!tagNames || tagNames.length === 0) {
    return [];
  }

  // Use ON CONFLICT DO NOTHING to safely insert only new tags
  // This is more efficient than selecting first
  const insertQuery = `
    INSERT INTO tags (user_id, name)
    SELECT $1, unnest($2::text[])
    ON CONFLICT (user_id, name) DO NOTHING;
  `;
  await pool.query(insertQuery, [userId, tagNames]);

  // Now, select all the tag IDs (both existing and newly created)
  const selectQuery = `
    SELECT id FROM tags WHERE user_id = $1 AND name = ANY($2::text[])
  `;
  const { rows } = await pool.query(selectQuery, [userId, tagNames]);
  return rows.map(row => row.id);
};

// --- NEW HELPER: syncNoteTags ---
// This function syncs the tags for a given note.
// It deletes old links and inserts new ones.
const syncNoteTags = async (noteId, tagIds) => {
  // Start a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Delete all existing tags for this note
    await client.query('DELETE FROM note_tags WHERE note_id = $1', [noteId]);

    // 2. Insert the new tag links
    if (tagIds && tagIds.length > 0) {
      const insertQuery = `
        INSERT INTO note_tags (note_id, tag_id)
        SELECT $1, unnest($2::int[])
      `;
      await client.query(insertQuery, [noteId, tagIds]);
    }
    
    // 3. Commit the transaction
    await client.query('COMMIT');
  } catch (err) {
    // 4. If anything fails, roll back
    await client.query('ROLLBACK');
    console.error("❌ Error in syncNoteTags:", err);
    throw err;
  } finally {
    // 5. Release the client back to the pool
    client.release();
  }
};

// --- UPDATED: findNotesByUserId ---
// We now join with tags to get all tags for each note.
// `n.*` will now include `updated_at`.
export const findNotesByUserId = async (userId) => {
  console.log(`🔍 Finding notes for user ID: ${userId}`);
  
  try {
    // This query groups by note and aggregates tag names into an array
    const query = `
      SELECT 
        n.*, 
        COALESCE(
          (SELECT json_agg(t.name) 
           FROM tags t
           JOIN note_tags nt ON t.id = nt.tag_id
           WHERE nt.note_id = n.id),
          '[]'::json
        ) AS tags
      FROM notes n
      WHERE n.user_id = $1
      ORDER BY n.pinned DESC, n.updated_at DESC; -- <-- Sort by updated_at
    `;
    const { rows } = await pool.query(query, [userId]);
    console.log(`✅ Found ${rows.length} notes`);
    return rows;
  } catch (err) {
    console.error("❌ Error in findNotesByUserId:", err);
    throw err;
  }
};

// --- UPDATED: createNoteForUser ---
// `RETURNING *` will include the new `updated_at` field.
export const createNoteForUser = async ({ userId, title, content, tags = [] }) => {
  console.log(`🔍 Creating note for user ID: ${userId}`);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Create the note
    const noteQuery = "INSERT INTO notes (user_id, title, content, pinned) VALUES ($1, $2, $3, $4) RETURNING *";
    const { rows: noteRows } = await client.query(noteQuery, [userId, title, content, false]);
    const newNote = noteRows[0];
    
    // 2. Find or create the tags
    const tagIds = await findOrCreateTags(userId, tags);

    // 3. Link note to tags
    if (tagIds.length > 0) {
      const insertTagsQuery = `
        INSERT INTO note_tags (note_id, tag_id)
        SELECT $1, unnest($2::int[])
      `;
      await client.query(insertTagsQuery, [newNote.id, tagIds]);
    }
    
    await client.query('COMMIT');
    
    // Manually add tags to the returned note object so the frontend sees it
    newNote.tags = tags;
    console.log("✅ Note created successfully with tags");
    return newNote;
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Error in createNoteForUser:", err);
    throw err;
  } finally {
    client.release();
  }
};

// --- UPDATED: updateNoteById ---
// The trigger will handle `updated_at`. `RETURNING *` will return it.
export const updateNoteById = async (noteId, userId, { title, content, tags = [] }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Update the note text
    const query = "UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *";
    const { rows } = await pool.query(query, [title, content, noteId, userId]);
    
    if (rows.length === 0) {
      // No rows updated, so just commit and return null
      await client.query('COMMIT');
      return null;
    }
    
    const updatedNote = rows[0];

    // 2. Find or create tags
    const tagIds = await findOrCreateTags(userId, tags);

    // 3. Sync the tags for the note
    await syncNoteTags(noteId, tagIds);
    
    await client.query('COMMIT');
    
    // Manually add tags to the returned object
    updatedNote.tags = tags;
    return updatedNote;

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Error in updateNoteById:", err);
    throw err;
  } finally {
    client.release();
  }
};

// --- (deleteNoteById stays the same) ---
export const deleteNoteById = async (noteId, userId) => {
  const query = "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *";
  const { rows } = await pool.query(query, [noteId, userId]);
  return rows[0] || null;
};

// --- (togglePinNote is FIXED) ---
// The trigger will handle `updated_at`. `RETURNING *` will return it.
export const togglePinNote = async (noteId, userId) => {
  const query = "UPDATE notes SET pinned = NOT pinned WHERE id = $1 AND user_id = $2 RETURNING *";
  
  // =================== FIX ===================
  // Removed the stray underscore "_"
  const { rows } = await pool.query(query, [noteId, userId]);
  // ===========================================
  
  // We need to fetch the tags again for the updated note
  if (rows.length > 0) {
    const tagQuery = `
      SELECT COALESCE(
        (SELECT json_agg(t.name) 
         FROM tags t
         JOIN note_tags nt ON t.id = nt.tag_id
         WHERE nt.note_id = $1),
        '[]'::json
      ) AS tags
    `;
    const { rows: tagRows } = await pool.query(tagQuery, [noteId]);
    rows[0].tags = tagRows[0].tags;
    return rows[0];
  }
  
  return null;
};

// --- NEW FUNCTION: findTagsByUserId ---
export const findTagsByUserId = async (userId) => {
  console.log(`🔍 Finding all tags for user ID: ${userId}`);
  try {
    const query = "SELECT name FROM tags WHERE user_id = $1 ORDER BY name ASC";
    const { rows } = await pool.query(query, [userId]);
    // Return an array of strings
    return rows.map(row => row.name);
  } catch (err) {
    console.error("❌ Error in findTagsByUserId:", err);
    throw err;
  }
};