import React from 'react';
import ThemeSwitcher from '../common/ThemeSwitcher';
import { StickyNote } from 'lucide-react';

const NavigationBar = ({ onLogout }) => {
  return (
    <nav className="w-full border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="container flex items-center justify-between px-6 py-4 mx-auto">
        <div className="flex items-center gap-2">
          <StickyNote className="w-6 h-6 text-amber-500" />
          <div className="text-xl font-extrabold">MyNotes</div>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
