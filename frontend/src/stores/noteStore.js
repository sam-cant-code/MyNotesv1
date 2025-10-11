// src/stores/noteStore.js
import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import toast from 'react-hot-toast'; // Import toast

const useNoteStore = create((set, get) => ({
  notes: [],
  error: null,
  loading: false,

  // Action to fetch all notes for the logged-in user
  fetchNotes: async () => {
    set({ loading: true, error: null });
    const token = useAuthStore.getState().token;
    if (!token) {
      return set({ loading: false, error: 'Authentication token not found.' });
    }

    try {
      const response = await axios.get('http://localhost:4000/api/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ notes: response.data, loading: false });
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      set({ error: 'Failed to fetch notes.', loading: false });
      toast.error('Failed to fetch notes.'); // Error toast
    }
  },

  // Action to add a new note
  addNote: async (title, content) => {
    set({ loading: true, error: null });
    const token = useAuthStore.getState().token;
    if (!token) {
      return set({ loading: false, error: 'Authentication token not found.' });
    }

    try {
      const response = await axios.post(
        'http://localhost:4000/api/notes',
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        notes: [response.data, ...state.notes],
        loading: false,
      }));
      toast.success('Note created successfully!'); // Success toast
    } catch (err) {
      console.error('Failed to add note:', err);
      set({ error: 'Failed to add note.', loading: false });
      toast.error('Failed to create note.'); // Error toast
    }
  },

  // Action to update a note
  updateNote: async (noteId, title, content) => {
    set({ loading: true, error: null });
    const token = useAuthStore.getState().token;
    if (!token) {
      return set({ loading: false, error: 'Authentication token not found.' });
    }

    try {
      const response = await axios.put(
        `http://localhost:4000/api/notes/${noteId}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId ? response.data : note
        ),
        loading: false,
      }));
      toast.success('Note updated successfully!'); // Success toast
    } catch (err) {
      console.error('Failed to update note:', err);
      set({ error: 'Failed to update note.', loading: false });
      toast.error('Failed to update note.'); // Error toast
    }
  },

  // Action to delete a note
  deleteNote: async (noteId) => {
    set({ loading: true, error: null });
    const token = useAuthStore.getState().token;
    if (!token) {
      return set({ loading: false, error: 'Authentication token not found.' });
    }

    try {
      await axios.delete(`http://localhost:4000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== noteId),
        loading: false,
      }));
      toast.success('Note deleted successfully!'); // Success toast
    } catch (err) {
      console.error('Failed to delete note:', err);
      set({ error: 'Failed to delete note.', loading: false });
      toast.error('Failed to delete note.'); // Error toast
    }
  },

  // Action to toggle pin status
  togglePin: async (noteId) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      return set({ error: 'Authentication token not found.' });
    }

    try {
      const response = await axios.patch(
        `http://localhost:4000/api/notes/${noteId}/pin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId ? response.data : note
        ),
      }));
      toast.success(response.data.pinned ? 'Note pinned!' : 'Note unpinned!'); // Success toast
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      set({ error: 'Failed to toggle pin.' });
      toast.error('Failed to update pin status.'); // Error toast
    }
  },
}));

export default useNoteStore;