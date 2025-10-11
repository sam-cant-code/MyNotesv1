import React from 'react';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg 
                 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-50 
                 focus:outline-none focus:ring-2 focus:ring-orange-500 
                 flex items-center justify-center group" 
      aria-label="Add new note"
    >
      <Plus 
        className="w-6 h-6 text-orange-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 
                   transition-all transform group-hover:rotate-90 duration-200 ease-out"
        strokeWidth={2} 
      />
    </button>
  );
};

export default FloatingActionButton;