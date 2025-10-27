import React from 'react';
import { Tag, X } from 'lucide-react';

const TagFilter = ({ allTags, selectedTag, setSelectedTag }) => {
  const handleTagChange = (e) => {
    setSelectedTag(e.target.value);
  };

  const handleClear = () => {
    setSelectedTag('');
  };

  return (
    <div className="relative w-full md:max-w-[220px]">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-600 dark:text-orange-500">
        <Tag className="w-5 h-5" />
      </div>
      <select
        value={selectedTag}
        onChange={handleTagChange}
        className="w-full pl-12 pr-12 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-600 focus:border-transparent transition-all appearance-none"
      >
        <option value="">All Tags</option>
        {allTags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      {selectedTag && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-500 rounded-full transition-colors"
          aria-label="Clear tag filter"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default TagFilter;