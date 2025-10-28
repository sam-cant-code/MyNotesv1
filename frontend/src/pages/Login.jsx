import React, { useState, useEffect } from 'react';
import { Sparkles, Tag, Search, RefreshCw } from 'lucide-react';

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
  const animatedText = 'Smarter.'; // <-- UPDATED ANIMATED TEXT

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
      icon: <Sparkles className="w-7 h-7" />,
      title: 'AI-Powered Assistant',
      description: 'Chat to create, update, and find insights from your notes.',
    },
    {
      icon: <Tag className="w-7 h-7" />,
      title: 'Organize with Tags',
      description: 'Add custom tags to your notes and filter by them instantly.',
    },
    {
      icon: <Search className="w-7 h-7" />,
      title: 'Instant Search & Pinning',
      description: 'Find any note with full-text search and pin your favorites.',
    },
    {
      icon: <RefreshCw className="w-7 h-7" />,
      title: 'Rich Text & Sync',
      description: 'Edit with lists and formatting, synced securely to the cloud.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      <nav className="w-full border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="text-xl font-extrabold">
            <span className="text-orange-600">My</span>
            <span className="text-slate-900 dark:text-slate-50">Notes</span>
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center flex-grow w-full text-center">
        <h1 className="w-fit mx-auto text-5xl font-bold sm:text-6xl md:text-7xl">
          <span>{staticText}</span>
          <span>{typedText}</span>
          <span className="ml-1 text-orange-600 animate-pulse">|</span>
        </h1>
        {/* --- UPDATED DESCRIPTION --- */}
        <p className="max-w-xl mx-auto mt-6 text-lg text-slate-600 dark:text-slate-400">
          Capture your thoughts and let our AI assistant organize, summarize,
          and find them for you. Your intelligent, synced notebook.
        </p>
        <button
          onClick={handleLogin}
          disabled={isLoggingIn} // Disable button when logging in
          className={`
            px-8 py-3 mt-8 font-semibold text-white bg-orange-600 rounded-lg shadow-sm
            transform transition-all duration-1000 ease-out 
            hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed
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
              <div className="text-orange-600">
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