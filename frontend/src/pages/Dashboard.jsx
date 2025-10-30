import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useNoteStore from '../stores/noteStore';
import NavigationBar from '../components/layout/NavigationBar';
import SearchBar from '../components/common/SearchBar';
import CreateNoteForm from '../components/forms/CreateNoteForm';
import EditNoteModal from '../components/forms/EditNoteModal';
import NotesGrid from '../components/notes/NotesGrid';
import FloatingActionButton from '../components/common/FloatingActionButton';
import ViewControls from '../components/layout/ViewControls';
import AiChatbot from '../components/common/AiChatbot';
import { Sparkles, X, FilterX } from 'lucide-react'; // Import FilterX
import TagFilter from '../components/common/TagFilter';
import toast from 'react-hot-toast'; // Import toast

const Dashboard = () => {
  const navigate = useNavigate();

  // Auth store state
  const { userProfile, error: authError, fetchProfile, logout } = useAuthStore();

  // Note store state - Destructure the AI filter state and actions
  const {
    notes,
    allTags,
    fetchNotes,
    fetchTags,
    loading: notesLoading,
    aiFilteredNoteIds, // Use this from the store
    setAiFilter,      // Use this action from the store
  } = useNoteStore();

  // Local state - Remove aiFilteredNotes and activeAiFilter
  const [isCreateFormVisible, setCreateFormVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isAiChatbotVisible, setAiChatbotVisible] = useState(false);

  // Fetch profile, notes, and tags on component mount
  useEffect(() => {
    fetchProfile();
    fetchNotes();
    fetchTags();
  }, [fetchProfile, fetchNotes, fetchTags]);

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

  // --- Use the action from the store to clear AI Filter ---
  const clearAiFilter = () => {
    setAiFilter(null); // Call store action
    toast('AI filter cleared.'); // Give user feedback
  };

  // If token becomes invalid, logout user
  useEffect(() => {
    if (authError) {
      handleLogout();
    }
  }, [authError, handleLogout]); // Added handleLogout to dependency array


  // Clear manual filters when AI filter becomes active
  useEffect(() => {
    if (aiFilteredNoteIds !== null) {
      setSearchQuery('');
      setSelectedTag('');
    }
  }, [aiFilteredNoteIds]);

  // Determine if AI filter is active
  const isAiFilterActive = aiFilteredNoteIds !== null;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      <NavigationBar onLogout={handleLogout} />

      <main className="flex-grow w-full pb-24">
        <div className="container px-6 py-8 mx-auto max-w-7xl">

          {/* --- AI Filter Banner --- */}
          {isAiFilterActive && (
            <div className="mb-6 p-3 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                  Showing notes filtered by AI Assistant.
                  <span className='ml-2 text-xs opacity-80'>({aiFilteredNoteIds.length} found)</span>
                </p>
              </div>
              <button
                onClick={clearAiFilter} // Use the correct clear function
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-200 bg-white dark:bg-slate-700 border border-orange-300 dark:border-orange-600 rounded-md hover:bg-orange-50 dark:hover:bg-slate-600 transition-colors"
                title="Clear AI filter"
              >
                <FilterX className="w-3.5 h-3.5" />
                Clear Filter
              </button>
            </div>
          )}

          {/* Controls Layout */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">

            {/* 1. Group for Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex-grow sm:max-w-xs"> {/* Adjusted width */}
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  disabled={isAiFilterActive} // Disable if AI filter is active
                />
              </div>
              <div className="flex-grow sm:max-w-[220px]"> {/* Adjusted width */}
                <TagFilter
                  allTags={allTags}
                  selectedTag={selectedTag}
                  setSelectedTag={setSelectedTag}
                  disabled={isAiFilterActive} // Disable if AI filter is active
                />
              </div>
            </div>

            {/* 2. View Controls */}
            <ViewControls
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>

          {isCreateFormVisible && <CreateNoteForm onNoteCreated={handleNoteCreated} />}

          <NotesGrid
            notes={notes} // Pass the original notes array
            notesLoading={notesLoading}
            onEdit={handleEditNote}
            viewMode={viewMode}
            sortBy={sortBy}
            searchQuery={searchQuery} // Pass manual search query
            selectedTag={selectedTag} // Pass manual selected tag
            aiFilteredNoteIds={aiFilteredNoteIds} // Pass AI filter IDs
          />
        </div>
      </main>

      {/* Conditionally render AI Chatbot */}
      {isAiChatbotVisible && (
        <AiChatbot
          onClose={() => setAiChatbotVisible(false)}
          // Remove onApplyFilter prop as the store handles it now
        />
      )}

      {/* FABs */}
      {!isCreateFormVisible && !isAiChatbotVisible && (
        <>
          {/* AI Button */}
          <button
            onClick={() => setAiChatbotVisible(true)}
            className="fixed bottom-28 right-8 w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-full shadow-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all z-50 focus:outline-none focus:ring-2 focus:ring-orange-600 flex items-center justify-center group"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="w-6 h-6 text-orange-600 transition-transform group-hover:scale-110" />
          </button>

          {/* Add Note Button */}
          <FloatingActionButton onClick={handleToggleCreateForm} />
        </>
      )}

      {/* Edit Modal */}
      {editingNote && <EditNoteModal note={editingNote} onClose={handleCloseEditModal} />}
    </div>
  );
};

export default Dashboard;