import React from 'react';
import { Grid3x3, LayoutGrid, List, Calendar, Clock } from 'lucide-react';

const ViewControls = ({ viewMode, setViewMode, sortBy, setSortBy }) => {
  return (
    <div className="flex items-center gap-4 mb-6 flex-wrap">
      {/* View Mode Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">View:</span>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors focus:outline-none ${
              viewMode === 'grid'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Grid view"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('masonry')}
            className={`p-2 rounded-md transition-colors focus:outline-none ${
              viewMode === 'masonry'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Masonry view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors focus:outline-none ${
              viewMode === 'list'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Sort:</span>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setSortBy('newest')}
            className={`px-3 py-2 rounded-md transition-colors text-sm font-medium flex items-center gap-1 focus:outline-none ${
              sortBy === 'newest'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            Newest
          </button>
          <button
            onClick={() => setSortBy('oldest')}
            className={`px-3 py-2 rounded-md transition-colors text-sm font-medium flex items-center gap-1 focus:outline-none ${
              sortBy === 'oldest'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Oldest
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewControls;