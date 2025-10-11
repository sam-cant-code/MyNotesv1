import React from 'react';
import { Pin, Edit2, Trash2 } from 'lucide-react';
import useNoteStore from '../../stores/noteStore';

const NoteCard = ({ note, onEdit, viewMode }) => {
  const { deleteNote, togglePin } = useNoteStore();

  const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent triggering other click events
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(note.id);
    }
  };

  const handleTogglePin = async (e) => {
    e.stopPropagation(); // Prevent triggering other click events
    await togglePin(note.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // Prevent triggering other click events
    onEdit(note);
  }

  // --- List View ---
  if (viewMode === 'list') {
    return (
      <div className="flex items-start gap-4 p-4 bg-white border rounded-lg border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:shadow-md transition-shadow">
        <div className="flex-1 min-w-0" onClick={handleEdit}>
          <div className="flex items-start gap-2 mb-1">
            {note.pinned && (
              <Pin className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0 mt-1" />
            )}
            <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate">
              {note.title}
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            {note.content}
          </p>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            {formattedDate}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleTogglePin}
            className={`p-2 rounded-md transition-colors ${
              note.pinned
                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={note.pinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className={`w-4 h-4 ${note.pinned ? 'fill-amber-500' : ''}`} />
          </button>
          <button
            onClick={handleEdit}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
            title="Edit note"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- Grid & Masonry View ---
  return (
    <div 
      className="group relative p-6 bg-white border rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer"
      onClick={handleEdit}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <Pin className="absolute top-3 right-3 w-5 h-5 text-amber-500 fill-amber-500" />
      )}

      {/* Note content */}
      <h3 className="font-bold text-slate-800 dark:text-slate-200 pr-8 mb-2">
        {note.title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-6 mb-4">
        {note.content}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{formattedDate}</p>

      {/* Action buttons - shown on hover */}
      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleTogglePin}
          className={`p-2 rounded-md transition-colors ${
            note.pinned
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
              : 'text-slate-400 bg-slate-100 dark:bg-slate-700 hover:text-amber-500'
          }`}
          title={note.pinned ? 'Unpin note' : 'Pin note'}
        >
          <Pin className={`w-4 h-4 ${note.pinned ? 'fill-amber-500' : ''}`} />
        </button>
        <button
          onClick={handleEdit}
          className="p-2 text-blue-500 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
          title="Edit note"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-red-500 bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          title="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NoteCard;