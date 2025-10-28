import React from 'react';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 bg-orange-600 rounded-full shadow-lg 
                 hover:bg-orange-700 transition-colors z-50 
                 focus:outline-none focus:ring-2 focus:ring-orange-600 
                 flex items-center justify-center group" 
      aria-label="Add new note"
    >
      <Plus 
        className="w-6 h-6 text-white 
                   transition-all transform group-hover:rotate-90 duration-200 ease-out"
        strokeWidth={2} 
      />
    </button>
  );
};

export default FloatingActionButton;