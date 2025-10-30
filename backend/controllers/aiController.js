import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  findNotesByUserId,
  createNoteForUser,
  updateNoteById,
  togglePinNote,
  deleteNoteById,
} from "../models/noteModel.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to format notes for AI context
const formatNotesForContext = (notes) => {
  return notes.map(note => ({
    id: note.id,
    title: note.title,
    // Strip HTML tags and limit context length for the AI
    content: note.content?.replace(/<[^>]*>/g, ' ').substring(0, 500) || '',
    tags: note.tags || [],
    pinned: note.pinned,
    created_at: note.created_at,
    updated_at: note.updated_at
  }));
};

// System prompt that defines the AI's capabilities
const getSystemPrompt = (notes) => {
  const notesContext = formatNotesForContext(notes);

  return `You are an intelligent note-taking assistant. You help users manage their notes through conversation.

USER'S CURRENT NOTES:
${JSON.stringify(notesContext, null, 2)}

CAPABILITIES:
1. CREATE_NOTE: Create a new note with title, content, and optional tags
2. CREATE_MULTIPLE_NOTES: Create multiple notes at once (for batch operations)
3. UPDATE_NOTE: Update an existing note by ID
4. PIN_NOTE: Pin or unpin a note by ID
5. DELETE_NOTE: Delete a note by ID (requires confirmation for bulk operations)
6. DELETE_MULTIPLE_NOTES: Delete multiple notes (ALWAYS requires confirmation)
7. SEARCH_NOTES: Search and filter notes by content, tags, or date
8. SUMMARIZE_NOTES: Provide summaries or analytics about notes
9. ANSWER_QUESTION: Answer questions about the user's notes

When the user asks you to perform an action, respond with a JSON object in this EXACT format:

For creating a single note:
{
  "action": "CREATE_NOTE",
  "parameters": {
    "title": "Note title here",
    "content": "Note content here (can include HTML)",
    "tags": ["tag1", "tag2"]
  },
  "message": "I've created a new note titled 'Note title here'"
}

For creating multiple notes:
{
  "action": "CREATE_MULTIPLE_NOTES",
  "parameters": {
    "notes": [
      {
        "title": "First Note",
        "content": "Content here",
        "tags": ["tag1"]
      },
      {
        "title": "Second Note",
        "content": "More content",
        "tags": ["tag2"]
      }
    ]
  },
  "message": "I've created 2 new notes for you!"
}

For updating a note:
{
  "action": "UPDATE_NOTE",
  "parameters": {
    "noteId": 123,
    "title": "Updated title",
    "content": "Updated content",
    "tags": ["tag1"]
  },
  "message": "I've updated your note"
}

For pinning a note:
{
  "action": "PIN_NOTE",
  "parameters": {
    "noteId": 123
  },
  "message": "I've pinned/unpinned your note"
}

For deleting a SINGLE note (no confirmation needed):
{
  "action": "DELETE_NOTE",
  "parameters": {
    "noteId": 123
  },
  "message": "I've deleted the note titled 'X'"
}

For requesting confirmation for MULTIPLE note deletions:
{
  "action": "REQUEST_DELETE_CONFIRMATION",
  "parameters": {
    "noteIds": [1, 2, 3],
    "reason": "matching tag 'work'"
  },
  "message": "⚠️ I found 3 notes matching 'work'. Are you sure you want to delete them? This action cannot be undone. Reply with 'yes, delete them' to confirm."
}

For executing confirmed multiple deletions:
{
  "action": "DELETE_MULTIPLE_NOTES",
  "parameters": {
    "noteIds": [1, 2, 3]
  },
  "message": "I've deleted 3 notes as requested."
}

For searching notes:
{
  "action": "SEARCH_NOTES",
  "parameters": {
    "query": "search term",
    "tags": ["tag1"],
    "dateRange": "last_year|last_month|this_week|today|pinned|none"
  },
  "message": "I found 5 notes matching your search..."
}

For summarizing notes:
{
  "action": "SUMMARIZE_NOTES",
  "parameters": {
    "type": "overview|by_tag|recent",
    "count": 10
  },
  "message": "Here's a summary of your notes..."
}

For answering questions (NO action needed):
{
  "action": "ANSWER_QUESTION",
  "message": "Your answer here based on the notes"
}

CRITICAL DELETION SAFETY RULES:
- ALWAYS require confirmation (REQUEST_DELETE_CONFIRMATION) for:
  * Deleting ALL notes (phrases like "delete all", "remove everything", "clear all notes")
  * Deleting MULTIPLE notes (2 or more)
  * Deleting notes by tag/category
  * Any ambiguous delete request
  * Bulk deletions based on search criteria
- ONLY use DELETE_NOTE (without confirmation) for:
  * Single, specific note deletion by ID or exact title
  * When user clearly identifies ONE note to delete
- When user confirms deletion (says "yes", "confirm", "go ahead", "delete them", etc.):
  * Use DELETE_MULTIPLE_NOTES action
  * Include all noteIds that were in the confirmation request
- Be EXTRA cautious with delete requests - when in doubt, ask for confirmation
- List which notes will be deleted in confirmation message

IMPORTANT RULES:
- Always respond with valid JSON ONLY - no markdown, no code blocks, just raw JSON.
- **When including links in your 'message' content, format them as HTML anchor tags: <a href="URL" target="_blank">Link Text</a>. Ensure target="_blank" is included.**
- When creating notes with lists, use HTML: <ul><li>item</li></ul> or <ol><li>item</li></ol>.
- When the user asks about their notes, search through the notes provided above.
- Be conversational but concise in your messages.
- If you need to reference a note, use its ID and title.
- When updating or pinning, make sure the note ID exists in the user's notes.
- If a note doesn't exist, tell the user in your message.
- For questions, analyze all the user's notes and provide helpful summaries.
- NEVER include markdown code blocks like \`\`\`json in your response.
- When asked to create multiple notes, use CREATE_MULTIPLE_NOTES action.
- For requests like "create 10 random notes", generate diverse, realistic example notes.

SEARCH & FILTER CAPABILITIES:
- Search by keywords in title or content
- Filter by tags
- Filter by date range (e.g., "last year", "last month", "this week", "today") - interpret these relative to the current date.
- Filter for pinned notes (e.g., "show pinned notes")
- Find recently updated notes
- Combine multiple filters

SUMMARY CAPABILITIES:
- Count notes by tag
- List most recent notes
- Identify most/least updated notes
- Show pinned notes
- Provide overview of all tags
- Show note creation trends`;
};

export const chatWithAI = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.id;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Fetch user's current notes to provide context
    const notes = await findNotesByUserId(userId);

    // Get the Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });

    // Build the conversation context
    let conversationContext = getSystemPrompt(notes) + "\n\n";

    // Add conversation history
    if (conversationHistory.length > 0) {
      conversationContext += "CONVERSATION HISTORY:\n";
      conversationHistory.forEach(msg => {
        conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      conversationContext += "\n";
    }

    // Add current user message
    conversationContext += `User: ${message}\n\nAssistant: `;

    // Call Gemini API
    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    let aiResponse = response.text();

    // Clean up response
    aiResponse = aiResponse.trim();
    if (aiResponse.startsWith('```json')) {
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (aiResponse.startsWith('```')) {
      aiResponse = aiResponse.replace(/```\n?/g, '').trim();
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Attempt to gracefully handle cases where AI might forget JSON format for simple answers
      if (!aiResponse.includes('{') && !aiResponse.includes('}')) {
        console.log("AI response wasn't JSON, treating as simple ANSWER_QUESTION.");
        parsedResponse = {
          action: "ANSWER_QUESTION",
          message: aiResponse // Use the raw text as the message
        };
      } else {
        return res.status(500).json({
          error: 'AI response was not in expected format',
          message: 'I encountered an error processing your request. Please try again.',
          rawResponse: aiResponse
        });
      }
    }

    // Execute the action based on AI's decision
    let actionResult = null;
    let searchResultIds = null;

    // Ensure parameters object exists even if AI forgets it for ANSWER_QUESTION
    if (!parsedResponse.parameters) {
        parsedResponse.parameters = {};
    }

    switch (parsedResponse.action) {
      case 'CREATE_NOTE': {
        const { title, content, tags } = parsedResponse.parameters;
        actionResult = await createNoteForUser({
          userId,
          title: title || 'Untitled Note',
          content: content || '',
          tags: tags || []
        });
        break;
      }
      case 'CREATE_MULTIPLE_NOTES': {
        const { notes: notesToCreate } = parsedResponse.parameters; // Renamed to avoid conflict
        actionResult = [];
        if (notesToCreate && Array.isArray(notesToCreate)) {
             for (const noteData of notesToCreate) {
                const createdNote = await createNoteForUser({
                    userId,
                    title: noteData.title || 'Untitled Note',
                    content: noteData.content || '',
                    tags: noteData.tags || []
                });
                actionResult.push(createdNote);
            }
        } else {
            console.error("Invalid parameters for CREATE_MULTIPLE_NOTES:", parsedResponse.parameters);
            parsedResponse.message = "Sorry, I couldn't create those notes due to an internal error with the parameters.";
        }
        break;
      }
      case 'UPDATE_NOTE': {
        const { noteId, title, content, tags } = parsedResponse.parameters;
        if (noteId === undefined) {
             parsedResponse.message = "I need the ID of the note you want to update.";
             break;
        }
        actionResult = await updateNoteById(noteId, userId, {
          title: title, // Allow undefined title to keep original
          content: content, // Allow undefined content to keep original
          tags: tags // Allow undefined tags to keep original
        });
        if (!actionResult) {
          parsedResponse.message = `I couldn't find note with ID ${noteId}. It might have been deleted.`;
        }
        break;
      }
      case 'PIN_NOTE': {
        const { noteId } = parsedResponse.parameters;
         if (noteId === undefined) {
             parsedResponse.message = "I need the ID of the note you want to pin or unpin.";
             break;
         }
        actionResult = await togglePinNote(noteId, userId);
        if (!actionResult) {
          parsedResponse.message = `I couldn't find note with ID ${noteId} to pin/unpin.`;
        } else {
           // Update message based on the result
           parsedResponse.message = `I've ${actionResult.pinned ? 'pinned' : 'unpinned'} the note "${actionResult.title}".`;
        }
        break;
      }
      case 'DELETE_NOTE': {
        const { noteId } = parsedResponse.parameters;
         if (noteId === undefined) {
             parsedResponse.message = "I need the ID of the note you want to delete.";
             break;
         }
        actionResult = await deleteNoteById(noteId, userId);
        if (!actionResult) {
          parsedResponse.message = `I couldn't find note with ID ${noteId} to delete.`;
        } else {
            parsedResponse.message = `I've deleted the note titled "${actionResult.title}".`;
        }
        break;
      }
      case 'DELETE_MULTIPLE_NOTES': {
        const { noteIds } = parsedResponse.parameters;
        if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
            parsedResponse.message = "I need the IDs of the notes you want to delete.";
            break;
        }
        actionResult = { deletedCount: 0, deletedNotes: [] };
        for (const noteId of noteIds) {
          const deleted = await deleteNoteById(noteId, userId);
          if (deleted) {
            actionResult.deletedCount++;
            actionResult.deletedNotes.push(deleted);
          }
        }
        parsedResponse.message = `Successfully deleted ${actionResult.deletedCount} note(s).`;
        break;
      }
      case 'REQUEST_DELETE_CONFIRMATION': {
        parsedResponse.requiresConfirmation = true;
        break;
      }
      case 'SEARCH_NOTES': {
        const { query, tags, dateRange } = parsedResponse.parameters;
        let filteredNotes = notes;

        // Filter by query (search title and text content)
        if (query) {
          const searchTerm = query.toLowerCase();
          filteredNotes = filteredNotes.filter(note =>
            note.title.toLowerCase().includes(searchTerm) ||
            (note.content && note.content.replace(/<[^>]*>/g, ' ').toLowerCase().includes(searchTerm))
          );
        }

        // Filter by tags
        if (tags && Array.isArray(tags) && tags.length > 0) {
          filteredNotes = filteredNotes.filter(note =>
            note.tags && tags.every(tag => note.tags.includes(tag)) // Use 'every' for AND logic if multiple tags given
          );
        }

        // Filter by date range (relative to update time)
        if (dateRange && dateRange !== 'none') {
            const now = new Date();
            let filterDateStart = null;
            let filterDateEnd = null; // Use end date for ranges like 'today', 'last_month'

            switch(dateRange.toLowerCase().replace(/[-_\s]/g, '')) { // Normalize date range string
              case 'today':
                filterDateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
                filterDateEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); // End of today
                break;
              case 'thisweek':
                const firstDayOfWeek = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1); // Assuming Monday is the first day
                filterDateStart = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek);
                filterDateEnd = new Date(filterDateStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1); // End of the week
                break;
              case 'lastweek':
                 const dayOfWeek = now.getDay() || 7; // Sunday=0 -> 7
                 filterDateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 6); // Start of last week (Monday)
                 filterDateEnd = new Date(filterDateStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1); // End of last week (Sunday)
                 break;
              case 'lastmonth':
                filterDateStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); // First day of last month
                filterDateEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999); // Last day of last month
                break;
              case 'lastyear':
                filterDateStart = new Date(now.getFullYear() - 1, 0, 1); // Jan 1st last year
                filterDateEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999); // Dec 31st last year
                break;
              case 'pinned':
                filteredNotes = filteredNotes.filter(note => note.pinned);
                filterDateStart = null; // No date filtering for pinned
                filterDateEnd = null;
                break;
            }

            // Apply date filter if start/end dates were determined
            if (filterDateStart && filterDateEnd) {
              filteredNotes = filteredNotes.filter(note => {
                const noteDate = new Date(note.updated_at); // Filter based on updated_at
                return noteDate >= filterDateStart && noteDate <= filterDateEnd;
              });
            } else if (filterDateStart) { // Fallback if only start date is needed (less common now)
               filteredNotes = filteredNotes.filter(note => new Date(note.updated_at) >= filterDateStart);
            }
        }

        actionResult = filteredNotes;
        searchResultIds = filteredNotes.map(note => note.id);

        // Update the message to be more informative
        let resultMessage = `Found ${filteredNotes.length} note(s)`;
        if (query) resultMessage += ` containing "${query}"`;
        if (tags && tags.length > 0) resultMessage += ` tagged with [${tags.join(', ')}]`;
        if (dateRange && dateRange !== 'none') resultMessage += ` from ${dateRange.replace('_', ' ')}`;
        resultMessage += '.';

        if (filteredNotes.length > 0) {
             resultMessage += `\n\nHere are the first few:\n` +
             filteredNotes.slice(0, 5).map(note => `- ${note.title} (ID: ${note.id})`).join('\n');
             if (filteredNotes.length > 5) {
                 resultMessage += `\n... and ${filteredNotes.length - 5} more.`;
             }
        }
        parsedResponse.message = resultMessage; // Overwrite original message with detailed results

        break;
      }
      case 'SUMMARIZE_NOTES': {
        const { type = 'overview', count = 5 } = parsedResponse.parameters; // Add defaults
        let summary = '';

        switch(type) {
          case 'overview':
            const totalNotes = notes.length;
            const pinnedCount = notes.filter(n => n.pinned).length;
            const allTags = [...new Set(notes.flatMap(n => n.tags || []))].sort();
            summary = `📊 Notes Overview:\n- Total notes: ${totalNotes}\n- Pinned notes: ${pinnedCount}\n- Unique tags used: ${allTags.length}`;
            if (allTags.length > 0) {
                summary += `\n- Tags: ${allTags.join(', ')}`;
            }
            break;
          case 'by_tag':
            const tagCounts = {};
            notes.forEach(note => {
              (note.tags || []).forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              });
            });
             if (Object.keys(tagCounts).length > 0) {
                 summary = '🏷️ Notes by Tag:\n' +
                 Object.entries(tagCounts)
                    .sort(([, countA], [, countB]) => countB - countA) // Sort by count descending
                    .map(([tag, count]) => `- ${tag}: ${count} note(s)`)
                    .join('\n');
             } else {
                 summary = "🏷️ You haven't used any tags yet.";
             }

            break;
          case 'recent':
            const recentNotes = notes
              .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
              .slice(0, count);
             if (recentNotes.length > 0) {
                 summary = `🕐 ${count} Most Recently Updated Notes:\n` +
                 recentNotes.map(note =>
                    `- ${note.title} (updated ${new Date(note.updated_at).toLocaleDateString()})`
                 ).join('\n');
             } else {
                 summary = "🕐 No notes found.";
             }
            break;
           default:
               summary = "I can provide an overview, summarize by tag, or list recent notes.";
        }

        parsedResponse.message = summary; // Set the message directly to the summary
        break;
      }
      case 'ANSWER_QUESTION':
        // No action needed, message already set (or derived from raw response)
        break;
      default:
        console.warn("Unknown AI action:", parsedResponse.action);
        parsedResponse.message = "I'm not sure how to perform that action. Please try rephrasing.";
    }

    // Return response
    res.json({
      message: parsedResponse.message || "Something went wrong, I didn't get a response message.", // Fallback message
      action: parsedResponse.action,
      actionResult: actionResult,
      searchResultIds: searchResultIds,
      parameters: parsedResponse.parameters,
      requiresConfirmation: parsedResponse.requiresConfirmation || false,
      conversationContext: {
        role: "assistant",
        // Use the final message content for context
        content: parsedResponse.message || aiResponse
      }
    });

  } catch (error) {
    console.error('Error in AI chat controller:', error);
    res.status(500).json({
      error: 'Failed to process AI request',
      message: 'Sorry, I encountered an internal server error. Please try again later.',
      details: error.message // Avoid sending detailed errors in production
    });
  }
};