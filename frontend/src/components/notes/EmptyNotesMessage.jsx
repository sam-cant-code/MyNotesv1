import React from 'react';

const EmptyNotesMessage = () => {
  return (
    <div className="text-center py-10">
      <p className="text-slate-500">You don't have any notes yet.</p>
      <p className="text-slate-500">Click "Create Note" to get started!</p>
    </div>
  );
};

export default EmptyNotesMessage;