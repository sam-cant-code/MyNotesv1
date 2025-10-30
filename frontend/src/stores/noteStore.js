import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import toast from 'react-hot-toast';

// Helper to get auth token
const getToken = () => useAuthStore.getState().token;

const useNoteStore = create((set, get) => ({
  notes: [],
  allTags: [],
  error: null,
  loading: false,
  aiFilteredNoteIds: null, // <-- NEW STATE: null means no AI filter, array means filter active

  // Action to set or clear the AI filter
  setAiFilter: (noteIds) => { // <-- NEW ACTION
    set({ aiFilteredNoteIds: noteIds });
    // Optionally clear manual filters when AI filter is set/cleared
    // get().setSelectedTag(''); // Example: Uncomment if you want this behavior
    // get().setSearchQuery(''); // Example: Uncomment if you want this behavior
  },

  fetchTags: async () => {
    set({ loading: true, error: null });
    const token = getToken();
    if (!token) {
      return set({ loading: false, error: 'Authentication token not found.' });
    }
    try {
      const response = await axios.get('http://localhost:4000/api/notes/tags', {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ allTags: response.data, loading: false });
    } catch (err) {
      console.error('Failed to fetch tags:', err);
      set({ error: 'Failed to fetch tags.', loading: false });
      toast.error('Failed to fetch tags.');
    }
  },

  fetchNotes: async () => {
    set({ loading: true, error: null });
    const token = getToken();
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
      toast.error('Failed to fetch notes.');
    }
  },

  addNote: async (title, content, tags = []) => {
    set({ loading: true, error: null });
    const token = getToken();
    if (!token) {
      return set({ loading: false, error: 'Authentication token not found.' });
    }
    const noteTitle = title.trim() === '' ? 'Untitled Note' : title;
    try {
      const response = await axios.post(
        'http://localhost:4000/api/notes',
        { title: noteTitle, content, tags },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        notes: [response.data, ...state.notes],
        loading: false,
        allTags: [...new Set([...state.allTags, ...tags])].sort(),
        // Clear AI filter when adding a note? Optional.
        // aiFilteredNoteIds: null,
      }));
      toast.success('Note created successfully!');
    } catch (err) {
      console.error('Failed to add note:', err);
      set({ error: 'Failed to add note.', loading: false });
      toast.error('Failed to create note.');
    }
  },

  updateNote: async (noteId, title, content, tags = []) => {
    set({ loading: true, error: null });
    const token = getToken();
    if (!token) {
      return set({ loading: false, error: 'Authentication token not found.' });
    }
    const noteTitle = title.trim() === '' ? 'Untitled Note' : title;
    try {
      const response = await axios.put(
        `http://localhost:4000/api/notes/${noteId}`,
        { title: noteTitle, content, tags },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === noteId ? response.data : note
        ),
        loading: false,
        allTags: [...new Set([...state.allTags, ...tags])].sort(),
      }));
      toast.success('Note updated successfully!');
    } catch (err) {
      console.error('Failed to update note:', err);
      set({ error: 'Failed to update note.', loading: false });
      toast.error('Failed to update note.');
    }
  },

  deleteNote: async (noteId) => {
    set({ loading: true, error: null });
    const token = getToken();
    if (!token) {
      return set({ loading: false, error: 'Authentication token not found.' });
    }
    try {
      await axios.delete(`http://localhost:4000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== noteId),
        // If the deleted note was part of the AI filter, remove it
        aiFilteredNoteIds: state.aiFilteredNoteIds?.filter(id => id !== noteId) || null,
        loading: false,
      }));
      toast.success('Note deleted successfully!');
    } catch (err) {
      console.error('Failed to delete note:', err);
      set({ error: 'Failed to delete note.', loading: false });
      toast.error('Failed to delete note.');
    }
  },

  togglePin: async (noteId) => {
    const token = getToken();
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
      toast.success(response.data.pinned ? 'Note pinned!' : 'Note unpinned!');
    } catch (err) {
      console.error('Failed to toggle pin:', err);
      set({ error: 'Failed to toggle pin.' });
      toast.error('Failed to update pin status.');
    }
  },
}));

export default useNoteStore;