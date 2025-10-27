import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, CornerDownLeft } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../../stores/authStore';
import useNoteStore from '../../stores/noteStore';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! How can I help you with your notes today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const token = useAuthStore((state) => state.token);
  const fetchNotes = useNoteStore((state) => state.fetchNotes);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage) return;

    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    // Format chat history for the backend
    const history = messages.map(msg => ({
      sender: msg.sender,
      text: msg.text,
    }));
    
    try {
      const response = await axios.post(
        'http://localhost:4000/api/ai/chat',
        { prompt: userMessage, history: history },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { message, actionPerformed } = response.data;
      setMessages((prev) => [...prev, { sender: 'ai', text: message }]);

      // If the AI performed an action, refresh the notes list
      if (actionPerformed) {
        fetchNotes();
      }

    } catch (error) {
      console.error("Chatbot request failed:", error);
      const errorMsg = error.response?.data?.message || "Sorry, I ran into an error. Please try again."
      setMessages((prev) => [...prev, { sender: 'ai', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 w-full max-w-md h-[70vh] max-h-[600px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl z-50 flex flex-col border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold">AI Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && <Bot className="w-5 h-5 text-blue-600 flex-shrink-0 mr-2 mt-1" />}
            <div
              className={`px-4 py-2 rounded-lg max-w-[85%] ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
            {msg.sender === 'user' && <User className="w-5 h-5 text-slate-500 flex-shrink-0 ml-2 mt-1" />}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <Bot className="w-5 h-5 text-blue-600 flex-shrink-0 mr-2 mt-1" />
            <div className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 rounded-bl-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="e.g. Create a note..."
            rows="1"
            className="w-full px-4 py-2 pr-20 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
          <p className="text-xs text-slate-400 mt-1 pl-1">
            <CornerDownLeft className="w-3 h-3 inline-block -mt-1" />+Shift for new line
          </p>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;