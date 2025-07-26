// src/components/AuthStatus.jsx
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Import auth from our Firebase config

function AuthStatus({ user }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to log out: ' + error.message);
    }
  };

  return (
    <div className="mt-auto pt-4 border-t border-gray-700 text-sm text-gray-400">
      {user ? (
        <div className="flex items-center justify-between">
          <span>Logged in as: <span className="text-yellow-400 font-medium truncate" title={user.email}>{user.email}</span></span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Not logged in.</p>
      )}
      <p className="text-sm text-gray-400 mt-2">Theme Switcher goes here</p>
    </div>
  );
}

export default AuthStatus;