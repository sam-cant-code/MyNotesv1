import React, { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react'; // Removed StickyNote
import useAuthStore from '../../stores/authStore';

const NavigationBar = ({ onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userProfile = useAuthStore((state) => state.userProfile);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  // Get user info
  const userName = userProfile?.user?.displayName || 'User';
  const userEmail = userProfile?.user?.email || '';
  const userPhoto = userProfile?.user?.photoURL;

  return (
    <nav className="w-full border-b border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900">
      <div className="container flex items-center justify-between px-6 py-3.5 mx-auto">
        <div className="flex items-center gap-2.5">
          {/* Removed the StickyNote icon div */}
          <div className="text-lg font-bold">
            <span className="text-orange-600">My</span>
            <span className="text-slate-800 dark:text-slate-100">Notes</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 p-0.5 rounded-full transition-opacity focus:outline-none hover:opacity-70"
            >
              {userPhoto ? (
                <img 
                  src={userPhoto} 
                  alt={userName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-sm font-semibold border-2 border-orange-300 dark:border-orange-800">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-600 overflow-hidden z-50">
                {/* User Info */}
                <div className="px-4 py-3.5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800 border-b border-orange-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    {userPhoto ? (
                      <img 
                        src={userPhoto} 
                        alt={userName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-700"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-semibold border-2 border-white dark:border-slate-700">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
                        {userName}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-300 hover:bg-orange-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;