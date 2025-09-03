import { create } from 'zustand';
import axios from 'axios';

// Get the auth token from the authStore
import useAuthStore from './authStore';

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
      // Add the new note to the beginning of the notes array
      set((state) => ({
        notes: [response.data, ...state.notes],
        loading: false,
      }));
    } catch (err) {
      console.error('Failed to add note:', err);
      set({ error: 'Failed to add note.', loading: false });
    }
  },
}));

export default useNoteStore;