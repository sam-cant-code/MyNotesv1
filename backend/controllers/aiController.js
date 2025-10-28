import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  findNotesByUserId,
  createNoteForUser,
  updateNoteById,
  togglePinNote,
} from "../models/noteModel.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to format notes for AI context
const formatNotesForContext = (notes) => {
  return notes.map(note => ({
    id: note.id,
    title: note.title,
    content: note.content?.replace(/<[^>]*>/g, ' ').substring(0, 500), // Strip HTML and limit length
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
2. UPDATE_NOTE: Update an existing note by ID
3. PIN_NOTE: Pin or unpin a note by ID
4. ANSWER_QUESTION: Answer questions about the user's notes

When the user asks you to perform an action, respond with a JSON object in this EXACT format:

For creating a note:
{
  "action": "CREATE_NOTE",
  "parameters": {
    "title": "Note title here",
    "content": "Note content here (can include HTML)",
    "tags": ["tag1", "tag2"]
  },
  "message": "I've created a new note titled 'Note title here'"
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

For answering questions (NO action needed):
{
  "action": "ANSWER_QUESTION",
  "message": "Your answer here based on the notes"
}

IMPORTANT RULES:
- Always respond with valid JSON ONLY - no markdown, no code blocks, just raw JSON
- When creating notes with lists, use HTML: <ul><li>item</li></ul> or <ol><li>item</li></ol>
- When the user asks about their notes, search through the notes provided above
- Be conversational but concise in your messages
- If you need to reference a note, use its ID
- When updating or pinning, make sure the note ID exists in the user's notes
- If a note doesn't exist, tell the user in your message
- For questions, analyze all the user's notes and provide helpful summaries
- NEVER include markdown code blocks like \`\`\`json in your response`;
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
      model: "gemini-1.5-flash",
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

    // Clean up response - remove markdown code blocks if present
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
      return res.status(500).json({ 
        error: 'AI response was not in expected format',
        message: 'I encountered an error processing your request. Please try again.',
        rawResponse: aiResponse
      });
    }

    // Execute the action based on AI's decision
    let actionResult = null;

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

      case 'UPDATE_NOTE': {
        const { noteId, title, content, tags } = parsedResponse.parameters;
        actionResult = await updateNoteById(noteId, userId, {
          title: title || 'Untitled Note',
          content: content || '',
          tags: tags || []
        });
        if (!actionResult) {
          parsedResponse.message = "I couldn't find that note. It may have been deleted.";
        }
        break;
      }

      case 'PIN_NOTE': {
        const { noteId } = parsedResponse.parameters;
        actionResult = await togglePinNote(noteId, userId);
        if (!actionResult) {
          parsedResponse.message = "I couldn't find that note to pin/unpin.";
        }
        break;
      }

      case 'ANSWER_QUESTION':
        // No action needed, just return the message
        break;

      default:
        parsedResponse.message = "I'm not sure how to help with that. I can create notes, update notes, pin notes, or answer questions about your notes.";
    }

    // Return response
    res.json({
      message: parsedResponse.message,
      action: parsedResponse.action,
      actionResult: actionResult,
      conversationContext: {
        role: "assistant",
        content: parsedResponse.message
      }
    });

  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ 
      error: 'Failed to process AI request',
      message: 'Sorry, I encountered an error. Please try again.',
      details: error.message
    });
  }
};