// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AuthCallback from './pages/AuthCallBack.jsx';
import ProtectedRoute from './components/ProtectedRoutes.jsx';
import useThemeStore from './stores/themeStore.js';

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <Router>
      {/* Add the Toaster component here */}
      <Toaster position="bottom-right" reverseOrder={false} />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;