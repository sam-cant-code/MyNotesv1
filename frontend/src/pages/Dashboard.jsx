import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useNoteStore from '../stores/noteStore';
import NavigationBar from '../components/layout/NavigationBar';
import CreateNoteForm from '../components/forms/CreateNoteForm';
import EditNoteModal from '../components/forms/EditNoteModal';
import NotesGrid from '../components/notes/NotesGrid';
import FloatingActionButton from '../components/common/FloatingActionButton';
import ViewControls from '../components/layout/ViewControls';

// --- NEW IMPORTS (This is what you were missing) ---
import ChatbotToggleButton from '../components/common/ChatBotToggleButton';
import Chatbot from '../components/chatbot/Chatbot';
// --- END NEW IMPORTS ---

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Auth store state
  const { userProfile, error: authError, fetchProfile, logout } = useAuthStore();

  // Note store state
  const { notes, fetchNotes, loading: notesLoading } = useNoteStore();

  // Local state
  const [isCreateFormVisible, setCreateFormVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'masonry', 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'

  // --- NEW STATE ---
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  // --- END NEW STATE ---


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

  // Handle note created (close form and refresh)
  const handleNoteCreated = () => {
    setCreateFormVisible(false);
  };

  // Handle edit note
  const handleEditNote = (note) => {
    setEditingNote(note);
  };

  // Handle close edit modal
  const handleCloseEditModal = () => {
    setEditingNote(null);
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
      <main className="flex-grow w-full pb-24">
        <div className="container px-6 py-8 mx-auto max-w-7xl">
          {/* Welcome Header */}

          {/* View Controls */}
          <ViewControls 
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {/* Create Note Form (Conditionally Rendered) */}
          {isCreateFormVisible && (
            <CreateNoteForm onNoteCreated={handleNoteCreated} />
          )}

          {/* Notes Grid */}
          <NotesGrid 
            notes={notes} 
            notesLoading={notesLoading}
            onEdit={handleEditNote}
            viewMode={viewMode}
            sortBy={sortBy}
          />
        </div>
      </main>

      {/* --- MODIFIED & NEW BUTTONS --- */}
      
      {/* Floating Action Button for Creating Notes */}
      {!isCreateFormVisible && !isChatbotOpen && (
        <FloatingActionButton onClick={handleToggleCreateForm} />
      )}

      {/* Chatbot Toggle Button */}
      {!isChatbotOpen && (
         <ChatbotToggleButton onClick={() => setIsChatbotOpen(true)} />
      )}
      
      {/* --- END MODIFIED & NEW BUTTONS --- */}


      {/* Edit Note Modal */}
      {editingNote && (
        <EditNoteModal 
          note={editingNote} 
          onClose={handleCloseEditModal} 
        />
      )}

      {/* --- NEW CHATBOT MODAL --- */}
      {isChatbotOpen && (
        <Chatbot onClose={() => setIsChatbotOpen(false)} />
      )}
      {/* --- END NEW CHATBOT MODAL --- */}

    </div>
  );
};

export default Dashboard;