import React, { useState } from 'react';
import useNoteStore from '../../stores/noteStore.js';

const CreateNoteForm = ({ onNoteCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const addNote = useNoteStore((state) => state.addNote);
  const loading = useNoteStore((state) => state.loading);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a title for your note.');
      return;
    }
    await addNote(title, content);
    setTitle('');
    setContent('');
    onNoteCreated();
  };

  return (
    <div className="p-6 mb-8 bg-white border rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Create a New Note</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
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
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Take a note..."
            rows="6"
            className="w-full px-4 py-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          ></textarea>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onNoteCreated}
            className="px-5 py-2 font-semibold border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 font-semibold text-white bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600 disabled:bg-amber-400 disabled:cursor-wait transition-colors"
          >
            {loading ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNoteForm;