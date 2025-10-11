import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import useNoteStore from '../../stores/noteStore.js';

const CreateNoteForm = ({ onNoteCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const addNote = useNoteStore((state) => state.addNote);
  const loading = useNoteStore((state) => state.loading);
  const titleInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-focus title input when modal opens
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      titleInputRef.current?.focus();
      return;
    }
    await addNote(title.trim(), content.trim());
    onNoteCreated();
  };

  const handleCancel = () => {
    onNoteCreated();
  };

  // Close on background click
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleCancel();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [loading]);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl my-8 flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Create a New Note
          </h2>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-5">
          {/* Title Input */}
          <div className="mb-5">
            <label htmlFor="note-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title
            </label>
            <input
              ref={titleInputRef}
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all caret-orange-500 dark:caret-orange-500"
              required
              autoFocus
            />
             {!title.trim() && title.length > 0 && (
              <p className="mt-1.5 text-xs text-red-500">Title is required</p>
            )}
          </div>

          {/* Content Textarea */}
          <div>
            <label htmlFor="note-content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Content
            </label>
            <textarea
              ref={textareaRef}
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="w-full px-3.5 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all resize-none overflow-hidden min-h-[200px] caret-orange-500 dark:caret-orange-500"
            />
             <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {content.length} characters
              </p>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-600 dark:bg-slate-700 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Note'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNoteForm;