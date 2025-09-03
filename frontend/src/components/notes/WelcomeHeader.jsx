import React from 'react';
import { PlusCircle, X } from 'lucide-react';

const WelcomeHeader = ({ userProfile, isCreateFormVisible, onToggleCreateForm }) => {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {userProfile?.user?.displayName || 'User'}!
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Here are your recent notes.
        </p>
      </div>
      <button
        onClick={onToggleCreateForm}
        className="flex items-center gap-2 px-5 py-2 font-semibold text-white bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600"
      >
        {isCreateFormVisible ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
        <span>{isCreateFormVisible ? 'Cancel' : 'Create Note'}</span>
      </button>
    </div>
  );
};

export default WelcomeHeader;