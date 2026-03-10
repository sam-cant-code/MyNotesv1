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
const NUM_NOTES_TO_CREATE = 4; 

// ====================================================================
// --- REALISTIC "LIFE" DATA FOR DEMO ---
// ====================================================================

const sampleNotes = [
  {
    title: '🚀 Startup Project: Vision 2026',
    content: '<h2>Project Alpha</h2><ul><li>Phase 1: Market Research</li><li>Phase 2: MVP Development</li><li>Phase 3: Beta Testing</li></ul><p>Remember to check <strong>scalability</strong> options.</p>',
    tags: ['work', 'vision', 'high-priority']
  },
  {
    title: '🍱 Meal Prep: Healthy Week',
    content: '<p>Focus on high-protein, low-carb meals this week.</p><ul><li>Grilled Salmon & Asparagus</li><li>Quinoa Salad with Chickpeas</li><li>Turkey Chili</li></ul>',
    tags: ['lifestyle', 'health', 'todo']
  },
  {
    title: '🌍 Travel Bucket List: Tokyo/Kyoto',
    content: '<p>Must visit: <strong>Shibuya Crossing</strong>, <strong>Fushimi Inari Shrine</strong>, and a traditional <strong>Onsen</strong>.</p><p>Budget: $3000 approx.</p>',
    tags: ['travel', 'lifestyle', 'ideas']
  },
  {
    title: '💡 Content Ideas: Tech Blog',
    content: '<ul><li>Why AI Agents are the future</li><li>React 19 vs Next.js</li><li>Clean Code tips for juniors</li></ul>',
    tags: ['creative', 'work']
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
      const pinned = tags.has('todo') || tags.has('high-priority') ? Math.random() < 0.5 : false; 
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