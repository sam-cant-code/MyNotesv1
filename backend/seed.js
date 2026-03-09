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

// We now have 20 unique notes defined below.
// Set this to 20 to create one of each.
const NUM_NOTES_TO_CREATE = 20;

// ====================================================================
// --- REALISTIC STUDENT DATA ---
// ====================================================================

// --- FIX: Titles, content, and tags are now linked in objects ---
const sampleNotes = [
  {
    title: 'DBS Exam Study Plan',
    content: '<ul><li>Review Module 3 (Normalization)</li><li>Practice SQL queries (Joins)</li><li>Check previous year papers</li><li>Ask Sam about 3NF vs BCNF</li></ul>',
    tags: ['exams', 'dbs', 'academics', 'todo']
  },
  {
    title: 'OS Assignment 2 - To Do',
    content: '<p>Implement the Banker\'s algorithm for deadlock avoidance. Due Friday 10 PM. Don\'t forget the PDF report.</p>',
    tags: ['assignment', 'os', 'academics', 'todo']
  },
  {
    title: 'Data Structures - Trees Summary',
    content: '<p><strong>Binary Search Trees:</strong> O(log n) average search.</p><p><strong>AVL Trees:</strong> Self-balancing. Know rotations (LL, LR, RR, RL).</p><p><strong>Red-Black Trees:</strong> Also self-balancing.</p>',
    tags: ['dsa', 'academics', 'exams']
  },
  {
    title: 'Final Year Project Ideas',
    content: '<p>1. AI Note-taking App (like this one lol)</p><p>2. Campus Event Finder (using React Native)</p><p>3. Mess Food Review App (PWA)</p>',
    tags: ['project', 'ideas', 'academics']
  },
  {
    title: 'Futsal Match - Saturday',
    content: '<p>Court 3 @ 5 PM. Need to bring water bottle. Ask Prem and Hari to come.</p>',
    tags: ['hobbies', 'personal', 'reminder']
  },
  {
    title: 'Groceries List',
    content: '<ul><li>Maggi (x4)</li><li>Eggs (1 tray)</li><li>Milk (1L)</li><li>Apples</li><li>Bread</li></ul>',
    tags: ['shopping', 'personal', 'todo']
  },
  {
    title: 'Mess Bill Reminder',
    content: '<p>Pay mess bill online before 5th Nov! Approx 4000 INR.</p>',
    tags: ['reminder', 'personal', 'finance']
  },
  {
    title: 'Movie Watchlist',
    content: '<ol><li>Dune Part 2</li><li>Shogun (TV Series)</li><li>The Boys (new season)</li><li>Monkey Man</li></ol>',
    tags: ['hobbies', 'personal', 'links']
  },
  {
    title: 'Tech Club Meeting Agenda',
    content: '<p>Agenda: 1. Finalize guest speaker for workshop. 2. Budget for upcoming hackathon. 3. T-shirt design ideas.</p>',
    tags: ['club', 'todo']
  },
  {
    title: 'Link: Cool CSS Generator',
    content: '<p>Check this out for gradients: <a href="https://cssgradient.io/" target="_blank">cssgradient.io</a>. Very useful for the project frontend.</p>',
    tags: ['links', 'project', 'dbs']
  },
  {
    title: 'Python ML Workshop Notes',
    content: '<p>Covered Pandas, NumPy, and Matplotlib. Basic regression models are simple to implement with scikit-learn.</p>',
    tags: ['club', 'academics', 'python']
  },
  {
    title: 'Hackathon Brainstorm - Team',
    content: '<p>Idea: Use the Gemini API to build a chatbot for the university website. Can answer questions about admissions, fees, holidays, etc.</p>',
    tags: ['project', 'ideas', 'club']
  },
  {
    title: 'BCSE302L - Normalization Notes',
    content: '<p><strong>1NF:</strong> Atomic values.</p><p><strong>2NF:</strong> 1NF + No partial dependencies.</p><p><strong>3NF:</strong> 2NF + No transitive dependencies.</p><p><strong>BCNF:</strong> Stricter 3NF.</p>',
    tags: ['dbs', 'academics', 'exams']
  },
  {
    title: 'Reminder: Call Mom',
    content: '<p>Call mom this weekend. Ask about flight tickets for December.</p>',
    tags: ['personal', 'reminder']
  },
  {
    title: 'Gym Workout Plan',
    content: '<p><strong>Monday:</strong> Chest/Tris</p><p><strong>Tuesday:</strong> Back/Bis</p><p><strong>Wednesday:</strong> Legs</p><p>Repeat.</p>',
    tags: ['hobbies', 'personal', 'health']
  },
  {
    title: 'Operating Systems - Deadlocks',
    content: '<p>Four conditions for deadlock: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. Need to remember this for the exam.</p>',
    tags: ['os', 'academics', 'exams']
  },
  {
    title: 'New Elden Ring DLC Thoughts',
    content: '<p>Shadow of the Erdtree looks amazing. The new bosses seem even harder. Can\'t wait to play it over the break.</p>',
    tags: ['hobbies', 'personal', 'gaming']
  },
  {
    title: 'Apartment Hunting Links',
    content: '<p>Links: <a href="https://housing.com" target="_blank">Housing.com</a>, <a href="https://nobroker.in" target="_blank">NoBroker</a>. Need 2BHK near campus.</p>',
    tags: ['personal', 'links', 'todo']
  },
  {
    title: 'DSA Lab Exam Prep',
    content: '<p>Practice stack, queue, and linked list problems. Lab exam is on Nov 15th. Check Moodle for viva questions.</p>',
    tags: ['dsa', 'exams', 'academics', 'todo']
  },
  {
    title: 'Ideas for project presentation',
    content: '<p>1. Live demo of all features.</p><p>2. Show database schema (SQL tables).</p><p>3. Focus on the AI part - show multiple examples.</p><p>4. Show the code for the AI controller.</p>',
    tags: ['dbs', 'project', 'todo', 'presentation']
  }
];

// This is a pool of extra tags that can be added randomly
const extraSampleTags = [
  'important', 'later', 'quick', 'ideas', 'finance', 'health', 'gaming', 'python'
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
  
  // --- FIX: Create a shuffled list of notes to pick from ---
  // This ensures we get unique notes if NUM_NOTES_TO_CREATE <= sampleNotes.length
  const shuffledNotes = [...sampleNotes].sort(() => 0.5 - Math.random());

  try {
    for (let i = 0; i < NUM_NOTES_TO_CREATE; i++) {
      await client.query('BEGIN');

      // 1. Generate random note data
      // --- FIX: Pick a coherent note object ---
      // Use modulo to loop back if creating more notes than samples
      const noteData = shuffledNotes[i % shuffledNotes.length];
      const { title, content, tags: baseTags } = noteData;
      
      // Get 1-2 *additional* random tags to make data more varied
      const numExtraTags = Math.floor(Math.random() * 3); // 0, 1, or 2
      const tags = new Set(baseTags); // Start with the note's base tags
      for (let j = 0; j < numExtraTags; j++) {
        tags.add(getRandomElement(extraSampleTags));
      }
      
      const tagsArray = Array.from(tags);
      
      // 2. Generate random timestamps
      // Set maxDaysAgo to 90 to simulate notes from one semester (e.g., Aug-Oct)
      const createdAt = getRandomTimestamp(90); 
      
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
      // Pin important notes
      const pinned = (tags.has('exams') || tags.has('assignment') || tags.has('reminder')) ? Math.random() < 0.4 : false; 
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
      console.log(`  > Created note ${i + 1}/${NUM_NOTES_TO_CREATE}: "${title}" (Tags: ${tagsArray.join(', ') || 'none'})`);
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

