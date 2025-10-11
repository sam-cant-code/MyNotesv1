import React, { useState } from 'react';
import { CornerDownLeft, X, Sparkles, Loader } from 'lucide-react';
import useNoteStore from '../../stores/noteStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const AiChatbot = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addNote = useNoteStore((state) => state.addNote);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // Call your new backend endpoint
      const response = await axios.post('http://localhost:4000/api/ai/generate-note', { prompt });
      const { title, content } = response.data;

      // Use your existing note store to add the new note
      await addNote(title, content);
      toast.success('AI has created a new note!');
      onClose(); // Close the chatbot after creating the note

    } catch (error) {
      console.error('Error with AI note generation:', error);
      toast.error('The AI had trouble creating your note. Please try again.');
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">AI Note Creator</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Main Content (Placeholder for future chat history) */}
      <div className="p-4 flex-grow h-32">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          What note should I create for you? You can say things like:
        </p>
        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 mt-2 space-y-1">
          <li>"A recipe for lasagna"</li>
          <li>"A to-do list for my weekend project"</li>
          <li>"Summarize the key points of quantum computing"</li>
        </ul>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt here..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 caret-orange-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <CornerDownLeft className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiChatbot;