// We now import the database functions from the noteModel
import { findNotesByUserId, createNoteForUser } from "../models/noteModel.js";

/**
 * @desc    Get all notes for the logged-in user
 * @route   GET /api/notes
 * @access  Private
 */
export const getNotesForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const notes = await findNotesByUserId(userId);
    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Server error while fetching notes" });
  }
};

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newNote = await createNoteForUser({ userId, title, content });
    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Server error while creating note" });
  }
};