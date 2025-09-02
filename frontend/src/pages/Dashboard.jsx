import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const Dashboard = () => {
  const navigate = useNavigate();

  // FIX: Select each piece of state individually.
  // This is more resilient to re-render loops.
  const userProfile = useAuthStore((state) => state.userProfile);
  const error = useAuthStore((state) => state.error);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // This effect will run ONLY ONCE after the component's initial render.
    fetchProfile();
  }, [fetchProfile]); // Note: It's safe to include the static fetchProfile action here.

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // This effect safely handles errors without causing a loop.
    if (error) {
      handleLogout();
    }
  }, [error, navigate]);

  return (
    <div className="min-h-screen p-4 bg-gray-100 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 font-semibold text-white bg-red-500 rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition"
          >
            Logout
          </button>
        </div>
        <p className="mb-6 text-lg text-gray-600">Welcome! This is a protected page.</p>

        {userProfile ? (
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-2xl font-semibold text-gray-700">Your Profile Data:</h2>
            <pre className="p-4 overflow-x-auto text-sm bg-gray-50 rounded">
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-gray-500">Loading profile...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;