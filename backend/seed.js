import { pool } from './config/postgres.js';
import dotenv from 'dotenv';

dotenv.config();

// ====================================================================
// --- CONFIGURATION ---
// ====================================================================

// !!! IMPORTANT !!!
// Change this to a valid user ID from your 'users' table.
// The script will create notes for this user.
const USER_ID_TO_SEED = 1; 

const NUM_NOTES_TO_CREATE = 20;

// ====================================================================
// --- SAMPLE DATA ---
// ====================================================================

const sampleTitles = [
  'Meeting Notes', 'Shopping List', 'Project Idea', 'Book Recommendations', 'Vacation Plans',
  'Recipe for Lasagna', 'Weekly Goals', 'Fitness Log', 'Draft Email', 'Important Links',
  'Brainstorm Session', 'Movie Watchlist', 'Gift Ideas', 'Home Improvement Tasks', 'Quote of the Day'
];

const sampleContents = [
  '<p>Discussed Q4 budget and roadmap. Key takeaways:</p><ul><li>Finalize projections by EOW.</li><li>Align with marketing on new campaign.</li></ul>',
  '<p>Need to buy:</p><ul><li>Milk</li><li>Eggs</li><li>Bread</li><li>Chicken</li></ul>',
  '<p>A mobile app that tracks water intake and reminds you to hydrate. Could use gamification.</p>',
  '<p>Books to read:</p><ol><li>"Dune" by Frank Herbert</li><li>"The Three-Body Problem" by Cixin Liu</li><li>"Atomic Habits" by James Clear</li></ol>',
  '<p>Trip to Japan: Spring 2026. Cities to visit: Tokyo, Kyoto, Osaka. Check flight prices in December.</p>',
  '<p>Ingredients: Ground beef, ricotta cheese, mozzarella, parmesan, lasagna noodles, marinara sauce.</p><p>Bake at 375°F for 45 minutes.</p>',
  '<p>This week:</p><ul><li>Finish presentation deck.</li><li>Go to the gym 3 times.</li><li>Read 2 chapters of my book.</li></ul>',
  '<p><strong>Monday:</strong> Chest day. Bench press: 3 sets of 8.</p><p><strong>Wednesday:</strong> Leg day. Squats: 4 sets of 10.</p>',
  '<p>Subject: Project Update</p><p>Hi team, here is the status update for the "Apollo" project...</p>',
  '<p>Useful tools:</p><ul><li><a href="https://figma.com">Figma</a> - Design</li><li><a href="https://notion.so">Notion</a> - Planning</li></ul>',
  '<p>New feature ideas: AI summaries, PDF uploads, collaborative editing.</p>',
  '<ul><li>Oppenheimer</li><li>Past Lives</li><li>Spider-Man: Across the Spider-Verse</li><li>Poor Things</li></ul>',
  '<p>Birthday gift for Mom: Spa day or a new necklace.</p>',
  '<ul><li>Fix leaky faucet in the bathroom.</li><li>Paint the guest room (color: light blue).</li><li>Organize the garage.</li></ul>',
  '<p><em>"The only way to do great work is to love what you do."</em> - Steve Jobs</p>'
];

const sampleTags = [
  'work', 'personal', 'ideas', 'todo', 'shopping', 'health', 'project', 'finance', 'inspiration', 'travel', 'food'
];

// ====================================================================
// --- HELPER FUNCTIONS ---
// ====================================================================

/**
 * Gets a random element from an array.
 */
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generates a random date between now and a certain number of days ago.
 * @param {number} maxDaysAgo - The maximum number of days in the past.
 * @returns {Date} A random date object.
 */
const getRandomTimestamp = (maxDaysAgo) => {
  const now = new Date();
  const maxMillisecondsAgo = maxDaysAgo * 24 * 60 * 60 * 1000;
  const randomMilliseconds = Math.floor(Math.random() * maxMillisecondsAgo);
  return new Date(now.getTime() - randomMilliseconds);
};

/**
 * Finds or creates tags and returns their IDs.
 * (Adapted from your noteModel.js to use a transaction client)
 */
const findOrCreateTags = async (client, userId, tagNames) => {
  if (!tagNames || tagNames.length === 0) {
    return [];
  }

  const insertQuery = `
    INSERT INTO tags (user_id, name)
    SELECT $1, unnest($2::text[])
    ON CONFLICT (user_id, name) DO NOTHING;
  `;
  await client.query(insertQuery, [userId, tagNames]);

  const selectQuery = `
    SELECT id FROM tags WHERE user_id = $1 AND name = ANY($2::text[])
  `;
  const { rows } = await client.query(selectQuery, [userId, tagNames]);
  return rows.map(row => row.id);
};

// ====================================================================
// --- MAIN SEEDER FUNCTION ---
// ====================================================================

const seedDatabase = async () => {
  console.log(`Starting to seed ${NUM_NOTES_TO_CREATE} notes for user ID: ${USER_ID_TO_SEED}...`);
  
  const client = await pool.connect();
  let createdCount = 0;

  try {
    for (let i = 0; i < NUM_NOTES_TO_CREATE; i++) {
      await client.query('BEGIN');

      // 1. Generate random note data
      const title = getRandomElement(sampleTitles);
      const content = getRandomElement(sampleContents);
      
      // Get 1-3 random tags
      const numTags = Math.floor(Math.random() * 4); // 0 to 3 tags
      const tags = new Set();
      for (let j = 0; j < numTags; j++) {
        tags.add(getRandomElement(sampleTags));
      }
      const tagsArray = Array.from(tags);
      
      // 2. Generate random timestamps
      const createdAt = getRandomTimestamp(730); // Up to 2 years ago
      
      // 70% chance the note was updated
      let updatedAt = createdAt;
      if (Math.random() < 0.7) {
        // Updated at a random time between creation and now
        const timeSinceCreation = new Date().getTime() - createdAt.getTime();
        const randomUpdateOffset = Math.random() * timeSinceCreation;
        updatedAt = new Date(createdAt.getTime() + randomUpdateOffset);
      }
      
      // 3. Insert the note
      const noteQuery = `
        INSERT INTO notes (user_id, title, content, pinned, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `;
      const pinned = Math.random() < 0.1; // 10% chance of being pinned
      const noteResult = await client.query(noteQuery, [
        USER_ID_TO_SEED, title, content, pinned, createdAt, updatedAt
      ]);
      const newNoteId = noteResult.rows[0].id;

      // 4. Find/Create and link tags
      if (tagsArray.length > 0) {
        const tagIds = await findOrCreateTags(client, USER_ID_TO_SEED, tagsArray);
        
        if (tagIds.length > 0) {
          const insertTagsQuery = `
            INSERT INTO note_tags (note_id, tag_id)
            SELECT $1, unnest($2::int[])
          `;
          await client.query(insertTagsQuery, [newNoteId, tagIds]);
        }
      }

      await client.query('COMMIT');
      createdCount++;
      console.log(`  > Created note ${i + 1}/${NUM_NOTES_TO_CREATE}: "${title}" (Created: ${createdAt.toLocaleDateString()})`);
    }

    console.log(`\n✅ Successfully created ${createdCount} notes for user ID: ${USER_ID_TO_SEED}.`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during seeding process, transaction rolled back:');
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
};

// --- Run the seeder ---
seedDatabase();