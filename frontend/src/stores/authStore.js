import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      userProfile: null,
      error: null,
      
      // Action to set the token
      setToken: (token) => {
        set({ token });
      },

      // Action to fetch user profile
      fetchProfile: async () => {
        const token = get().token;
        if (!token) {
          set({ error: 'No token found' });
          return;
        }
        try {
          const response = await axios.get('http://localhost:4000/api/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ userProfile: response.data, error: null });
        } catch (err) {
          console.error('Failed to fetch profile:', err);
          set({ error: 'Failed to fetch profile. Session may be expired.' });
        }
      },

      // Action for logging out
      logout: () => {
        set({ token: null, userProfile: null, error: null });
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ token: state.token }), // only persist the token
    }
  )
);

export default useAuthStore;