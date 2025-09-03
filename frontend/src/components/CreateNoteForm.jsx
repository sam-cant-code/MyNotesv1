import React, { useState } from 'react';
import useNoteStore from '../stores/noteStore';

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
    onNoteCreated(); // This function will be passed from Dashboard to close the form
  };

  return (
    <div className="p-6 mb-8 bg-white border rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700">
      <h2 className="text-xl font-bold mb-4">Create a New Note</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Take a note..."
            rows="4"
            className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 font-semibold text-white bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600 disabled:bg-amber-400 disabled:cursor-wait"
          >
            {loading ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNoteForm;