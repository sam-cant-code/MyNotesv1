import React from 'react';

const Login = () => {
  const handleLogin = () => {
    // Redirect to the backend's Google authentication route
    window.location.href = 'http://localhost:4000/auth/google';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-10 text-center bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-gray-800">MyNotes Login</h1>
        <p className="mt-2 text-gray-600">Please sign in to continue.</p>
        <button
          onClick={handleLogin}
          className="inline-block px-6 py-3 mt-6 text-lg font-semibold text-white bg-blue-500 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default Login;