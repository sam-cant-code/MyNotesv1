import React from 'react';
import { FaRegFileAlt, FaThumbtack, FaPencilAlt, FaSyncAlt } from 'react-icons/fa';

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:4000/auth/google';
  };

  const features = [
    {
      icon: <FaRegFileAlt className="w-7 h-7" />,
      title: 'Create Notes Instantly',
      description: 'Quickly jot down your thoughts, ideas, and reminders with ease.',
    },
    {
      icon: <FaThumbtack className="w-7 h-7" />,
      title: 'Organize & Pin',
      description: 'Pin important notes and keep your workspace organized.',
    },
    {
      icon: <FaPencilAlt className="w-7 h-7" />,
      title: 'Edit & Delete',
      description: 'Easily update or remove notes as your ideas evolve.',
    },
    {
      icon: <FaSyncAlt className="w-7 h-7" />,
      title: 'Sync Across Devices',
      description: 'Access your notes anywhere—securely in the cloud.',
    },
  ];

  return (
    // Use a flex column layout to fit everything on one screen
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900">
      {/* --- Navbar --- */}
      <nav className="w-full border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="text-xl font-extrabold">MyNotes</div>
        </div>
      </nav>

      {/* --- Main Content (Hero) --- */}
      {/* flex-grow allows this section to take up the available space, pushing the features down */}
      <main className="flex flex-col items-center justify-center flex-grow w-full text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          Your Notes, Everywhere.
        </h1>
        <p className="max-w-xl mx-auto mt-6 text-lg text-slate-600">
          The fastest way to capture, organize, and access your notes anywhere. Fast, simple,
          and always in sync.
        </p>
        <button
          onClick={handleLogin}
          className="px-8 py-3 mt-8 font-semibold text-white transition bg-amber-500 rounded-lg shadow-sm hover:bg-amber-600"
        >
          Get Started &gt;
        </button>
      </main>

      {/* --- Features Section --- */}
      <section className="w-full pb-16">
        <div className="container grid grid-cols-1 gap-8 mx-auto md:grid-cols-2 lg:grid-cols-4 px-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 text-left bg-white border rounded-xl border-slate-200"
            >
              <div className="text-amber-500">
                {feature.icon}
              </div>
              <h3 className="mt-4 font-bold">{feature.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Login;