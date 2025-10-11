import React, { useState } from 'react';
import { X } from 'lucide-react';
import useNoteStore from '../../stores/noteStore';

const EditNoteModal = ({ note, onClose }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || '');
  const updateNote = useNoteStore((state) => state.updateNote);
  const loading = useNoteStore((state) => state.loading);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a title for your note.');
      return;
    }
    await updateNote(note.id, title, content);
    onClose();
  };

  // Close on background click
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Edit Note</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="w-full px-4 py-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Take a note..."
              rows="10"
              className="w-full px-4 py-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            ></textarea>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 font-semibold border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 font-semibold text-white bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600 disabled:bg-amber-400 disabled:cursor-wait transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNoteModal;
