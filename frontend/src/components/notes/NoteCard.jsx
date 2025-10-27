import React from 'react';
// --- (Added Tag icon for our tags feature) ---
import { Pin, Edit2, Trash2, Tag } from 'lucide-react';
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
  };

  // --- (This is the tags rendering function from our last update) ---
  const renderTags = () => {
    if (!note.tags || note.tags.length === 0) {
      return null;
    }

    if (viewMode === 'list') {
      return (
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500">
          <Tag className="w-3.5 h-3.5" />
          {note.tags.length} {note.tags.length > 1 ? 'tags' : 'tag'}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {note.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 rounded-full text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

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
            <h3 className="text-slate-900 dark:text-slate-100 break-words overflow-wrap-anywhere font-medium">
              {note.title}
            </h3>
          </div>
          
          {/* =========== HTML RENDERING FIX (Part 1) ============ */}
          {/* Replaced <p> with <div> and added dangerouslySetInnerHTML */}
          {/* Added 'prose' classes to style the HTML */}
          <div
            className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-400 line-clamp-2 break-words overflow-wrap-anywhere"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
          {/* ====================================================== */}
          
          {renderTags()} 
          
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            {formattedDate}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {/* (No pin bug here, but added 'fill-current' fix for list view) */}
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
      className="group relative p-4 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 cursor-pointer transition-colors flex flex-col h-full"
      onClick={handleEdit}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <Pin className="absolute top-3 right-3 w-3.5 h-3.5 text-orange-600 fill-orange-600" />
      )}

      {/* Note content */}
      <div className="flex-grow">
        <h3 className="text-slate-900 dark:text-slate-100 pr-6 mb-2 break-words overflow-wrap-anywhere font-medium">
          {note.title}
        </h3>
        
        {/* =========== HTML RENDERING FIX (Part 1) ============ */}
        {/* Replaced <p> with <div> and added dangerouslySetInnerHTML */}
        {/* Added 'prose' classes to style the HTML */}
        <div
          className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-400 break-words overflow-wrap-anywhere line-clamp-4 mb-3"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
        {/* ====================================================== */}

        {renderTags()}
      </div>

      {/* Footer with date and actions */}
      <div className="flex items-end justify-between pt-4 mt-auto">
        <p className="text-xs text-slate-500 dark:text-slate-500">{formattedDate}</p>

        {/* Action buttons */}
        <div className="flex gap-1">
          
          {/* =========== PIN BUTTON FIX (Part 2) ============ */}
          {/* BEFORE: ${note.pinned ? 'text-orange-600 opacity-100' : ''}
            AFTER:  ${note.pinned ? 'text-orange-600' : ''}
            (Also added transition-opacity to all buttons)
          */}
          <button
            onClick={handleTogglePin}
            className={`p-1 text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity ${
              note.pinned ? 'text-orange-600' : ''
            }`}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-current' : ''}`} />
          </button>
          {/* =================================================== */}

          <button
            onClick={handleEdit}
            className="p-1 text-slate-400 hover:text-orange-600 dark:hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;