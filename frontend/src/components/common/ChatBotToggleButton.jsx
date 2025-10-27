import React from 'react';
import { Bot } from 'lucide-react';

const ChatbotToggleButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-28 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-110 z-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:shadow-blue-900/50"
      aria-label="Open AI chatbot"
    >
      <Bot className="w-6 h-6" />
    </button>
  );
};

export default ChatbotToggleButton;