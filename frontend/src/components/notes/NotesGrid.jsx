import React from 'react';
import NoteCard from './NoteCard';
import EmptyNotesMessage from './EmptyNotesMessage';

const NotesGrid = ({ notes, notesLoading, onEdit, viewMode, sortBy, searchQuery }) => {
  if (notesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading notes...</p>
        </div>
      </div>
    );
  }

  // Filter notes based on search query
  let filteredNotes = notes;
  if (searchQuery && searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filteredNotes = notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      (note.content && note.content.toLowerCase().includes(query))
    );
  }

  if (filteredNotes.length === 0 && searchQuery) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-500 dark:text-slate-400">No notes found matching "{searchQuery}"</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Try a different search term</p>
      </div>
    );
  }

  if (filteredNotes.length === 0) {
    return <EmptyNotesMessage />;
  }

  // Sort notes
  let sortedNotes = [...filteredNotes];
  if (sortBy === 'oldest') {
    sortedNotes = sortedNotes.sort((a, b) => {
      // Keep pinned notes at top
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // Then sort by date
      return new Date(a.created_at) - new Date(b.created_at);
    });
  }
  // Default is newest (already sorted from backend with pinned first)

  // Separate pinned and unpinned notes
  const pinnedNotes = sortedNotes.filter(note => note.pinned);
  const unpinnedNotes = sortedNotes.filter(note => !note.pinned);

  const renderNotes = (notesList, showTitle = false) => {
    if (notesList.length === 0) return null;

    return (
      <>
        {showTitle && (
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
            {showTitle}
          </h2>
        )}
        <div className={
          viewMode === 'list' 
            ? 'flex flex-col gap-3'
            : viewMode === 'masonry'
            ? 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6'
            : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
        }>
          {notesList.map((note) => (
            <div 
              key={note.id}
              className={viewMode === 'masonry' ? 'break-inside-avoid' : ''}
            >
              <NoteCard 
                note={note}
                onEdit={onEdit}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-8">
      {pinnedNotes.length > 0 && renderNotes(pinnedNotes, 'Pinned')}
      {unpinnedNotes.length > 0 && renderNotes(unpinnedNotes, pinnedNotes.length > 0 ? 'Others' : '')}
    </div>
  );
};

export default NotesGrid;