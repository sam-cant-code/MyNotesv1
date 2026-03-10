import { pool } from './config/postgres.js';
import dotenv from 'dotenv';

dotenv.config();

// ====================================================================
// --- CONFIGURATION ---
// ====================================================================

// !!! IMPORTANT !!!
// Change this to a valid user ID from your 'users' table.
const USER_ID_TO_SEED = 1;

// Set to the number of sample notes provided below.
const NUM_NOTES_TO_CREATE = 8; 

// ====================================================================
// --- REALISTIC "LIFE" DATA FOR DEMO ---
// ====================================================================

const sampleNotes = [
  {
    title: 'Grocery List',
    content: '<ul><li>Milk</li><li>Eggs</li><li>Bread</li><li>Bananas</li><li>Coffee beans</li></ul>',
    tags: ['personal', 'shopping', 'todo']
  },
  {
    title: 'Dinner Ideas',
    content: '<p><strong>Quick Meals:</strong></p><ul><li>Spaghetti bolognese</li><li>Chicken tacos</li><li>Vegetable stir fry</li><li>Homemade pizza</li></ul>',
    tags: ['food', 'ideas', 'personal']
  },
  {
    title: 'Japan Trip Ideas',
    content: '<p>Need to plan for next spring!</p><ul><li>Visit Tokyo and Kyoto</li><li>Try authentic ramen and street sushi</li><li>See temples and shrines in Kyoto</li><li>Explore local fish markets</li><li>Book Shinkansen (bullet train) passes early</li></ul>',
    tags: ['travel', 'personal', 'ideas']
  },
  {
    title: 'Workout Routine',
    content: '<p><strong>Monday:</strong> Chest and Triceps</p><p><strong>Wednesday:</strong> Back and Biceps</p><p><strong>Friday:</strong> Legs and Core</p><p>Focus on progressive overload this month.</p>',
    tags: ['health', 'personal']
  },
  {
    title: 'Movie Watchlist',
    content: '<ol><li>Dune Part Two</li><li>Interstellar</li><li>The Batman</li><li>Oppenheimer</li></ol>',
    tags: ['entertainment', 'personal', 'lists']
  },
  {
    title: 'Book Recommendations',
    content: '<ul><li>Atomic Habits by James Clear</li><li>Deep Work by Cal Newport</li><li>The Psychology of Money by Morgan Housel</li></ul>',
    tags: ['reading', 'ideas']
  },
  {
    title: 'Birthday Gift Ideas for Sarah',
    content: '<ul><li>Sony Wireless headphones</li><li>Nice ceramic coffee mug</li><li>Mechanical gaming mouse</li></ul>',
    tags: ['personal', 'shopping', 'ideas']
  },
  {
    title: 'Car Maintenance Checklist',
    content: '<p>Need to get this done before the road trip:</p><ul><li>Oil change</li><li>Check tire pressure and tread</li><li>Replace wiper fluid</li></ul>',
    tags: ['todo', 'reminder', 'personal']
  }
];

const extraSampleTags = ['urgent', 'later', 'favorites'];

// ====================================================================
// --- HELPER FUNCTIONS ---
// ====================================================================

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomTimestamp = (maxDaysAgo) => {
  const now = new Date();
  const maxMillisecondsAgo = maxDaysAgo * 24 * 60 * 60 * 1000;
  const randomMilliseconds = Math.floor(Math.random() * maxMillisecondsAgo);
  return new Date(now.getTime() - randomMilliseconds);
};

const findOrCreateTags = async (client, userId, tagNames) => {
  if (!tagNames || tagNames.length === 0) return [];

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
  
  const shuffledNotes = [...sampleNotes].sort(() => 0.5 - Math.random());

  try {
    for (let i = 0; i < NUM_NOTES_TO_CREATE; i++) {
      await client.query('BEGIN');

      const noteData = shuffledNotes[i % shuffledNotes.length];
      const { title, content, tags: baseTags } = noteData;
      
      const numExtraTags = Math.floor(Math.random() * 2); 
      const tags = new Set(baseTags);
      for (let j = 0; j < numExtraTags; j++) {
        tags.add(getRandomElement(extraSampleTags));
      }
      
      const tagsArray = Array.from(tags);
      const createdAt = getRandomTimestamp(60); 
      
      let updatedAt = createdAt;
      if (Math.random() < 0.6) {
        const timeSinceCreation = new Date().getTime() - createdAt.getTime();
        updatedAt = new Date(createdAt.getTime() + (Math.random() * timeSinceCreation));
      }
      
      const noteQuery = `
        INSERT INTO notes (user_id, title, content, pinned, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `;
      const pinned = tags.has('todo') ? Math.random() < 0.5 : false; 
      const noteResult = await client.query(noteQuery, [
        USER_ID_TO_SEED, title, content, pinned, createdAt, updatedAt
      ]);
      const newNoteId = noteResult.rows[0].id;

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
      console.log(`  > Created note ${i + 1}/${NUM_NOTES_TO_CREATE}: "${title}"`);
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

seedDatabase();