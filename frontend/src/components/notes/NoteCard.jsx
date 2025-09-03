import React from 'react';

const NoteCard = ({ title, content, date }) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-6 text-left bg-white border rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 transform transition-shadow hover:shadow-lg">
      <h3 className="font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{content}</p>
      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">{formattedDate}</p>
    </div>
  );
};

export default NoteCard;