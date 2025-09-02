import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // Use the store action to set the token
      setToken(token);
      navigate('/dashboard');
    } else {
      console.error("Authentication failed: No token received.");
      navigate('/login');
    }
  }, [location, navigate, setToken]);

  return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
};

export default AuthCallback;