// ============================================================
// FILE 1: backend/controllers/noteController.js
// COPY THIS ENTIRE FILE - REPLACE YOUR EXISTING FILE
// ============================================================

import {
  findNotesByUserId,
  createNoteForUser,
  updateNoteById,
  deleteNoteById,
  togglePinNote,
} from "../models/noteModel.js";

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

export const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const noteId = req.params.id;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const updatedNote = await updateNoteById(noteId, userId, {
      title,
      content,
    });

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Server error while updating note" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const deletedNote = await deleteNoteById(noteId, userId);

    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Server error while deleting note" });
  }
};

export const togglePin = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const updatedNote = await togglePinNote(noteId, userId);

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error toggling pin:", error);
    res.status(500).json({ message: "Server error while toggling pin" });
  }
};