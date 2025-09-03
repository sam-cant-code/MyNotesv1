import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useNoteStore from '../stores/noteStore';
import NavigationBar from '../components/layout/NavigationBar';
import WelcomeHeader from '../components/notes/WelcomeHeader';
import CreateNoteForm from '../components/forms/CreateNoteForm';
import NotesGrid from '../components/notes/NotesGrid';

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

  // Handle toggle create form
  const handleToggleCreateForm = () => {
    setCreateFormVisible(!isCreateFormVisible);
  };

  // Handle note created (close form)
  const handleNoteCreated = () => {
    setCreateFormVisible(false);
  };

  // If token becomes invalid, logout user
  useEffect(() => {
    if (authError) {
      handleLogout();
    }
  }, [authError]);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      {/* Navigation Bar */}
      <NavigationBar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-grow w-full">
        <div className="container px-6 py-8 mx-auto">
          {/* Welcome Header */}
          <WelcomeHeader 
            userProfile={userProfile}
            isCreateFormVisible={isCreateFormVisible}
            onToggleCreateForm={handleToggleCreateForm}
          />

          {/* Create Note Form (Conditionally Rendered) */}
          {isCreateFormVisible && (
            <CreateNoteForm onNoteCreated={handleNoteCreated} />
          )}

          {/* Notes Grid */}
          <NotesGrid notes={notes} notesLoading={notesLoading} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;