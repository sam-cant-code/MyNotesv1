import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { PlusCircle } from 'lucide-react';

// --- Placeholder Note Card Component ---
const NoteCard = ({ title, content, date }) => (
  <div className="p-6 text-left bg-white border rounded-xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 transform transition-shadow hover:shadow-lg">
    <h3 className="font-bold text-slate-800 dark:text-slate-200">{title}</h3>
    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{content}</p>
    <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">{date}</p>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const userProfile = useAuthStore((state) => state.userProfile);
  const error = useAuthStore((state) => state.error);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (error) {
      handleLogout();
    }
  }, [error, navigate]);

  // --- Placeholder Notes Data ---
  const sampleNotes = [
    { title: "Project Ideas", content: "Brainstorming for the new web application. Need to focus on user experience.", date: "September 3, 2025" },
    { title: "Meeting Notes", content: "Discussed Q4 goals. Key takeaway: prioritize mobile optimization.", date: "September 2, 2025" },
    { title: "Grocery List", content: "Milk, bread, eggs, and coffee.", date: "September 1, 2025" },
  ];

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {userProfile?.name || 'User'}!
              </h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Here are your recent notes.
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2 font-semibold text-white bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Note</span>
            </button>
          </div>

          {/* --- Notes Grid --- */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sampleNotes.map((note, index) => (
              <NoteCard key={index} {...note} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;