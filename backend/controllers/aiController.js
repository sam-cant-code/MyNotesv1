import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  createNoteForUser,
  deleteNoteById,
  updateNoteById,
  togglePinNote,
  findNotesByUserId,
} from "../models/noteModel.js";

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the functions that Gemini can call
// We pass the 'userId' from our auth middleware for security
const tools = {
  create_note: async ({ userId, title, content }) => {
    if (!title) {
      return { error: "Title is required to create a note." };
    }
    try {
      const newNote = await createNoteForUser({ userId, title, content: content || "" });
      return { success: true, message: `Note created with title: ${newNote.title}`, note: newNote };
    } catch (error) {
      return { error: `Failed to create note: ${error.message}` };
    }
  },
  
  update_note: async ({ userId, noteId, title, content }) => {
    if (!noteId || !title) {
      return { error: "Note ID and title are required to update a note." };
    }
    try {
      const updatedNote = await updateNoteById(noteId, userId, { title, content: content || "" });
      if (!updatedNote) {
        return { error: "Note not found or you don't have permission to update it." };
      }
      return { success: true, message: `Note updated: ${updatedNote.title}`, note: updatedNote };
    } catch (error) {
      return { error: `Failed to update note: ${error.message}` };
    }
  },
  
  delete_note: async ({ userId, noteId }) => {
    if (!noteId) {
      return { error: "Note ID is required to delete a note." };
    }
    try {
      const deletedNote = await deleteNoteById(noteId, userId);
      if (!deletedNote) {
        return { error: "Note not found or you don't have permission to delete it." };
      }
      return { success: true, message: `Note deleted: ${deletedNote.title}` };
    } catch (error) {
      return { error: `Failed to delete note: ${error.message}` };
    }
  },
  
  toggle_pin: async ({ userId, noteId }) => {
    if (!noteId) {
      return { error: "Note ID is required to toggle a note's pin status." };
    }
    try {
      const updatedNote = await togglePinNote(noteId, userId);
      if (!updatedNote) {
        return { error: "Note not found or you don't have permission to pin it." };
      }
      return { 
        success: true, 
        message: `Note ${updatedNote.pinned ? 'pinned' : 'unpinned'}: ${updatedNote.title}`,
        note: updatedNote 
      };
    } catch (error) {
      return { error: `Failed to toggle pin: ${error.message}` };
    }
  },
};

// Define the Gemini model with function calling
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: `You are a helpful assistant for a note-taking app. 
- Your goal is to help the user manage their notes by calling the provided functions.
- Before calling a function, confirm the action with the user unless the user's intent is very explicit (e.g., "create a note", "delete this").
- When a user asks to delete, update, or pin a note but doesn't provide a title or ID, you MUST ask for clarification.
- You do not have the ability to "search" for notes by title. Your functions only accept a \`noteId\`. 
- If the user wants to act on a note by its title (e.g., "delete the 'shopping' note"), you must tell them you can only perform actions by \`noteId\`.
- **CRITICAL:** The user's notes are provided in the chat history with their \`noteId\`s. Use this context. For example, if the user's notes are listed and they say "delete note 12", you must call \`delete_note({ noteId: 12 })\`.
- After a function call is executed, respond with a simple, friendly confirmation message based on the function's JSON output.`,
  tools: {
    functionDeclarations: [
      {
        name: "create_note",
        description: "Create a new note.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "The title of the note." },
            content: { type: "STRING", description: "The content of the note." },
          },
          required: ["title"],
        },
      },
      {
        name: "update_note",
        description: "Update an existing note by its ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            noteId: { type: "NUMBER", description: "The unique ID of the note to update." },
            title: { type: "STRING", description: "The new title for the note." },
            content: { type: "STRING", description: "The new content for the note." },
          },
          required: ["noteId", "title"],
        },
      },
      {
        name: "delete_note",
        description: "Delete a note by its ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            noteId: { type: "NUMBER", description: "The unique ID of the note to delete." },
          },
          required: ["noteId"],
        },
      },
      {
        name: "toggle_pin",
        description: "Pin or unpin a note by its ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            noteId: { type: "NUMBER", description: "The unique ID of the note to pin or unpin." },
          },
          required: ["noteId"],
        },
      },
    ],
  },
});

// Main chat handler
export const handleChat = async (req, res) => {
  try {
    const { prompt, history } = req.body;
    const userId = req.user.id; // From 'protect' middleware

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required." });
    }

    // 1. Get the user's current notes to provide as context
    const notes = await findNotesByUserId(userId);
    const notesContext = "Here is a list of the user's current notes:\n" + 
      notes.map(n => `- ${n.title} (id: ${n.id})`).join("\n");
      
    // 2. Format chat history for the model
    let formattedHistory = (history || []).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // --- NEW FIX ---
    // The chat history MUST start with a 'user' role.
    // Find the first 'user' message and slice from there.
    const firstUserIndex = formattedHistory.findIndex(msg => msg.role === 'user');
    
    // If no user messages are found (e.g., history is just the initial AI greeting),
    // start with an empty history.
    if (firstUserIndex > -1) {
      formattedHistory = formattedHistory.slice(firstUserIndex);
    } else {
      formattedHistory = [];
    }
    // --- END FIX ---

    // 3. Start the chat session
    const chat = model.startChat({
      history: [
        ...formattedHistory, // Use the new sanitized history
        // Add the notes context *before* the user's latest prompt
        { role: 'user', parts: [{ text: `(Context: ${notesContext})` }] }
      ]
    });

    // 4. Send the user's new prompt
    const result = await chat.sendMessage(prompt);
    const response = result.response;

    // 5. Check if the model wants to call a function
    const functionCall = response.functionCalls?.[0];

    if (functionCall) {
      const { name, args } = functionCall;

      if (!tools[name]) {
        return res.status(500).json({ message: `Unknown function call: ${name}` });
      }

      // 6. Call the function with the model's arguments AND our secure userId
      // We prioritize our server-side userId over any ID the model might hallucinate
      const functionResult = await tools[name]({ ...args, userId });

      // 7. Send the function's result back to the model
      const result2 = await chat.sendMessage([
        {
          functionResponse: {
            name,
            response: functionResult,
          },
        },
      ]);
      
      // 8. Send the model's final, natural-language response to the user
      const finalResponse = result2.response.text();
      res.status(200).json({ 
        message: finalResponse,
        // We also send a flag to tell the frontend to refresh the notes list
        actionPerformed: functionResult.success 
      });

    } else {
      // 9. No function call, just a regular chat response
      const text = response.text();
      res.status(200).json({ message: text, actionPerformed: false });
    }

  } catch (error) {
    console.error("Error in AI chat handler:", error);
    res.status(500).json({ message: "Server error while processing chat" });
  }
};