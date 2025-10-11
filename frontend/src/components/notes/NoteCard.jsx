import React from 'react';
import { Pin, Edit2, Trash2 } from 'lucide-react';
import useNoteStore from '../../stores/noteStore';

const NoteCard = ({ note, onEdit, viewMode }) => {
  const { deleteNote, togglePin } = useNoteStore();

  const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(note.id);
    }
  };

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    await togglePin(note.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(note);
  }

  // --- List View ---
  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-start gap-4 p-4 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 transition-colors"
      >
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleEdit}>
          <div className="flex items-start gap-2 mb-1">
            {note.pinned && (
              <Pin className="w-3 h-3 text-orange-600 fill-orange-600 flex-shrink-0 mt-1" />
            )}
            <h3 className="text-slate-900 dark:text-slate-100 break-words overflow-wrap-anywhere">
              {note.title}
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 break-words overflow-wrap-anywhere">
            {note.content}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            {formattedDate}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={handleTogglePin}
            className={`p-1.5 text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 ${note.pinned ? 'text-orange-600' : ''}`}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleEdit}
            className="p-1.5 text-slate-400 hover:text-orange-600 dark:hover:text-orange-500"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // --- Grid & Masonry View ---
  return (
    <div 
      className="group relative p-4 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-pointer transition-colors"
      onClick={handleEdit}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <Pin className="absolute top-3 right-3 w-3.5 h-3.5 text-orange-600 fill-orange-600" />
      )}

      {/* Note content */}
      <h3 className="text-slate-900 dark:text-slate-100 pr-6 mb-2 break-words overflow-wrap-anywhere">
        {note.title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 break-words overflow-wrap-anywhere line-clamp-4 mb-3">
        {note.content}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-500">{formattedDate}</p>

      {/* Action buttons - always visible but subtle on hover */}
      <div className="absolute bottom-3 right-3 flex gap-1">
        <button
          onClick={handleTogglePin}
          className={`p-1 text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 opacity-0 group-hover:opacity-100 ${note.pinned ? 'text-orange-600 opacity-100' : ''}`}
          title={note.pinned ? 'Unpin' : 'Pin'}
        >
          <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleEdit}
          className="p-1 text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 opacity-0 group-hover:opacity-100"
          title="Edit"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NoteCard;