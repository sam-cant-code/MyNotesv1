import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useThemeStore from '../../stores/themeStore.js'; // <-- Import the new store

const ThemeSwitcher = () => {
  const theme = useThemeStore((state) => state.theme); // <-- Use the new store
  const toggleTheme = useThemeStore((state) => state.toggleTheme); // <-- Use the new store

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
    >
      {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
    </button>
  );
};

export default ThemeSwitcher;