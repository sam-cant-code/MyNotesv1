import React from 'react';

const WelcomeHeader = ({ userProfile }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">
        Welcome, {userProfile?.user?.displayName || 'User'}!
      </h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Here are your notes.
      </p>
    </div>
  );
};

export default WelcomeHeader;