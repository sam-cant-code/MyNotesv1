import React from 'react';
import { PlusCircle } from 'lucide-react';

const FloatingActionButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 p-4 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transform transition-all duration-200 hover:scale-110 z-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:shadow-amber-900/50"
      aria-label="Add new note"
    >
      <PlusCircle className="w-6 h-6" />
    </button>
  );
};

export default FloatingActionButton;