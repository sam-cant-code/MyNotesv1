import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useNoteStore from '../stores/noteStore';
import NavigationBar from '../components/layout/NavigationBar'; // <-- This line was missing
import SearchBar from '../components/common/SearchBar';
import CreateNoteForm from '../components/forms/CreateNoteForm';
import EditNoteModal from '../components/forms/EditNoteModal';
import NotesGrid from '../components/notes/NotesGrid';
import FloatingActionButton from '../components/common/FloatingActionButton';
import ViewControls from '../components/layout/ViewControls';
import AiChatbot from '../components/common/AiChatbot'; 
import { Sparkles } from 'lucide-react'; 

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Auth store state
  const { userProfile, error: authError, fetchProfile, logout } = useAuthStore();

  // Note store state
  const { notes, fetchNotes, loading: notesLoading } = useNoteStore();

  // Local state
  const [isCreateFormVisible, setCreateFormVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiChatbotVisible, setAiChatbotVisible] = useState(false); // State for chatbot visibility

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
      <NavigationBar onLogout={handleLogout} />

      <main className="flex-grow w-full pb-24">
        <div className="container px-6 py-8 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="w-full md:max-w-sm">
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
            <ViewControls 
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>

          {isCreateFormVisible && <CreateNoteForm onNoteCreated={handleNoteCreated} />}

          <NotesGrid 
            notes={notes} 
            notesLoading={notesLoading}
            onEdit={handleEditNote}
            viewMode={viewMode}
            sortBy={sortBy}
            searchQuery={searchQuery}
          />
        </div>
      </main>

      {isAiChatbotVisible && <AiChatbot onClose={() => setAiChatbotVisible(false)} />}

      {!isCreateFormVisible && !isAiChatbotVisible && (
        <>
          <button
            onClick={() => setAiChatbotVisible(true)}
            className="fixed bottom-28 right-8 w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all z-50 focus:outline-none focus:ring-2 focus:ring-orange-600 flex items-center justify-center group"
            aria-label="Open AI Note Creator"
          >
            <Sparkles className="w-6 h-6 text-orange-600 transition-transform group-hover:scale-110" />
          </button>
          
          <FloatingActionButton onClick={handleToggleCreateForm} />
        </>
      )}

      {editingNote && <EditNoteModal note={editingNote} onClose={handleCloseEditModal} />}
    </div>
  );
};

export default Dashboard;