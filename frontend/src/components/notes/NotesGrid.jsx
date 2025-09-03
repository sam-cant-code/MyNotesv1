import React from 'react';
import NoteCard from './NoteCard';
import EmptyNotesMessage from './EmptyNotesMessage';

const NotesGrid = ({ notes, notesLoading }) => {
  if (notesLoading) {
    return <p>Loading notes...</p>;
  }

  if (notes.length === 0) {
    return <EmptyNotesMessage />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard 
          key={note.id} 
          title={note.title} 
          content={note.content} 
          date={note.created_at} 
        />
      ))}
    </div>
  );
};

export default NotesGrid;