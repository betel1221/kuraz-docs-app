// src/components/SettingsMenu.jsx
import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function SettingsMenu({ currentUser, onClose, isDarkMode, toggleDarkMode }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div className={`absolute top-full right-0 mt-2 border rounded-md shadow-lg z-50 p-4 w-60
      ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800'}
    `}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={`font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Settings</h3>
        <button
          onClick={onClose}
          className={`p-1 rounded-full ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
          title="Close Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {currentUser && (
        <div className={`mb-3 pb-3 ${isDarkMode ? 'border-b border-gray-600' : 'border-b border-gray-300'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Logged in as:</p>
          <p className="font-semibold truncate">{currentUser.email}</p>
        </div>
      )}

      <div className="mb-3">
        <label className="flex items-center justify-between text-sm cursor-pointer">
          <span>Dark Mode</span>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
            className="sr-only peer"
          />
          <div className="relative w-9 h-5 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-600"></div>
        </label>
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Log Out
      </button>
    </div>
  );
}

export default SettingsMenu;