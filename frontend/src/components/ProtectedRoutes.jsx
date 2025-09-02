import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const ProtectedRoute = ({ children }) => {
  // Get the token directly from the Zustand store
  const token = useAuthStore((state) => state.token);

  if (!token) {
    // If no token is found in the store, redirect to the login page
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;