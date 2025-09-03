import React, { useState, useEffect } from 'react';
import { FileText, Pin, PenTool, RefreshCw } from 'lucide-react';

const Login = () => {
  // --- Animation State ---
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100); 
    return () => clearTimeout(timer);
  }, []);


  // --- Typing Animation Logic ---
  const [typedText, setTypedText] = useState('');
  const staticText = 'Your Notes, ';
  const animatedText = 'Everywhere.';

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < animatedText.length) {
        setTypedText(animatedText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 80);

    return () => clearInterval(intervalId);
  }, []);

  // --- Component Logic ---
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Add state for login status

  const handleLogin = () => {
    setIsLoggingIn(true); // Set login status to true on click
    window.location.href = 'http://localhost:4000/auth/google';
  };

  const features = [
    {
      icon: <FileText className="w-7 h-7" />,
      title: 'Create Notes Instantly',
      description: 'Quickly jot down your thoughts, ideas, and reminders with ease.',
    },
    {
      icon: <Pin className="w-7 h-7" />,
      title: 'Organize & Pin',
      description: 'Pin important notes and keep your workspace organized.',
    },
    {
      icon: <PenTool className="w-7 h-7" />,
      title: 'Edit & Delete',
      description: 'Easily update or remove notes as your ideas evolve.',
    },
    {
      icon: <RefreshCw className="w-7 h-7" />,
      title: 'Sync Across Devices',
      description: 'Access your notes anywhere—securely in the cloud.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      <nav className="w-full border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="text-xl font-extrabold">MyNotes</div>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center flex-grow w-full text-center">
        <h1 className="w-fit mx-auto text-5xl font-bold sm:text-6xl md:text-7xl">
          <span>{staticText}</span>
          <span>{typedText}</span>
          <span className="ml-1 text-amber-500 animate-pulse">|</span>
        </h1>
        <p className="max-w-xl mx-auto mt-6 text-lg text-slate-600 dark:text-slate-400">
          The fastest way to capture, organize, and access your notes anywhere. Fast, simple,
          and always in sync.
        </p>
        <button
          onClick={handleLogin}
          disabled={isLoggingIn} // Disable button when logging in
          className={`
            px-8 py-3 mt-8 font-semibold text-white bg-amber-500 rounded-lg shadow-sm
            transform transition-all duration-1000 ease-out 
            hover:bg-amber-600 disabled:bg-amber-400 disabled:cursor-not-allowed
            ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}
          `}
          style={{ transitionDelay: '1200ms' }}
        >
          {isLoggingIn ? 'Signing in...' : 'Get Started >'}
        </button>
      </main>

      <section className="w-full pb-16">
        <div className="container grid grid-cols-1 gap-8 mx-auto md:grid-cols-2 lg:grid-cols-4 px-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`
                p-6 text-left bg-white border rounded-xl border-slate-200
                transform transition-all duration-700 ease-out
                dark:bg-slate-800 dark:border-slate-700
                ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="text-amber-500">
                {feature.icon}
              </div>
              <h3 className="mt-4 font-bold">{feature.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Login;