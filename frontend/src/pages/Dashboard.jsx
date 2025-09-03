import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useNoteStore from '../stores/noteStore'; // Import the note store
import ThemeSwitcher from '../components/ThemeSwitcher';
import CreateNoteForm from '../components/CreateNoteForm'; // Import the new form
import { PlusCircle, X } from 'lucide-react';

// --- Note Card Component ---
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


const Dashboard = () => {
  const navigate = useNavigate();
  // Auth store state
  const { userProfile, error: authError, fetchProfile, logout } = useAuthStore();

  // Note store state
  const { notes, fetchNotes, loading: notesLoading } = useNoteStore();

  // Local state to manage form visibility
  const [isCreateFormVisible, setCreateFormVisible] = useState(false);

  // Fetch profile and notes on component mount
  useEffect(() => {
    fetchProfile();
    fetchNotes();
  }, [fetchProfile, fetchNotes]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If token becomes invalid, logout user
  useEffect(() => {
    if (authError) {
      handleLogout();
    }
  }, [authError]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      {/* --- Navigation Bar --- */}
      <nav className="w-full border-b border-slate-200 dark:border-slate-700">
        <div className="container flex items-center justify-between px-6 py-4 mx-auto">
          <div className="text-xl font-extrabold">MyNotes</div>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-grow w-full">
        <div className="container px-6 py-8 mx-auto">
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
              onClick={() => setCreateFormVisible(!isCreateFormVisible)}
              className="flex items-center gap-2 px-5 py-2 font-semibold text-white bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600"
            >
              {isCreateFormVisible ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
              <span>{isCreateFormVisible ? 'Cancel' : 'Create Note'}</span>
            </button>
          </div>

          {/* --- Create Note Form (Conditionally Rendered) --- */}
          {isCreateFormVisible && <CreateNoteForm onNoteCreated={() => setCreateFormVisible(false)} />}


          {/* --- Notes Grid --- */}
          {notesLoading && <p>Loading notes...</p>}
          
          {!notesLoading && notes.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-500">You don't have any notes yet.</p>
              <p className="text-slate-500">Click "Create Note" to get started!</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} title={note.title} content={note.content} date={note.created_at} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;