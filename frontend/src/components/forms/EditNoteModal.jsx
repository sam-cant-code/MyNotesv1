import React, { useState, useEffect, useRef } from 'react';
import { X, Bold, Italic, List, ListOrdered } from 'lucide-react';
import useNoteStore from '../../stores/noteStore';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// ... (Keep the TiptapToolbar component as is) ...
const TiptapToolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 border-b border-slate-300 dark:border-slate-600 p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  );
};

const EditNoteModal = ({ note, onClose }) => {
  const [title, setTitle] = useState(note.title);
  // --- NEW STATE: Initialize tags from note ---
  const [tags, setTags] = useState(note.tags ? note.tags.join(', ') : '');
  
  const updateNote = useNoteStore((state) => state.updateNote);
  const loading = useNoteStore((state) => state.loading);
  const titleInputRef = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: note.content || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert min-h-[150px] max-w-full p-4 focus:outline-none',
      },
    },
  });

  // Helper to parse tags string into an array
  const parseTags = (tagsString) => {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  // Check for changes in tags as well
  const hasChanges = 
    title !== note.title || 
    (editor && editor.getHTML() !== (note.content || '')) ||
    tags !== (note.tags ? note.tags.join(', ') : '');
  
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.setSelectionRange(title.length, title.length);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const htmlContent = editor.getHTML();
    const tagsArray = parseTags(tags); // --- Parse tags ---
    await updateNote(note.id, title, htmlContent, tagsArray); // --- Pass tags ---
    onClose();
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [loading, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl my-8 flex flex-col border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Edit Note
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form is now outside the div so submit button works */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
          <div className="px-6 py-5 flex-grow">
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
                className="w-full px-3.5 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 caret-orange-600"
              />
            </div>

            {/* --- NEW TAGS INPUT --- */}
            <div className="mb-5">
              <label htmlFor="note-tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tags (comma separated)
              </label>
              <input
                id="note-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. work, recipe, todo"
                className="w-full px-3.5 py-2.5 text-base border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 caret-orange-600"
              />
            </div>
            {/* ---------------------- */}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Content
              </label>
              <div className="rounded-lg border border-slate-300 dark:border-slate-600 focus-within:border-orange-600 focus-within:ring-2 focus-within:ring-orange-600/20 overflow-hidden">
                  <TiptapToolbar editor={editor} />
                  <EditorContent editor={editor} />
              </div>
              {hasChanges && (
                <p className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span>
                  Unsaved changes
                </p>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNoteModal;