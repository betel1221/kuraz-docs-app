import React from 'react';
import kuraztechLogo from '../assets/kuraztech-logo.png';
import welcomeBackground from '../assets/kuraz-welcome-bg.png'; // Assuming you have a background image

const WelcomePage = ({ onStart }) => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-gray-100"
      style={{ backgroundImage: `url(${welcomeBackground})` }}
    >
      {/* Blurry overlay to make text readable */}
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-0"></div>
      
      {/* Main content container */}
      <div className="relative z-10 p-8 rounded-lg text-center max-w-xl mx-auto">
        <img src={kuraztechLogo} alt="KurazTech Logo" className="h-24 mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4 drop-shadow-lg">
          Welcome to KurazHelp
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8 font-light">
          Your personal AI-powered document assistant and learning companion,
          inspired by Ethiopia's symbol of enlightenment. KurazHelp helps you
          create, edit, and understand your documents with ease.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => onStart('login')}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Login
          </button>
          <button
            onClick={() => onStart('signup')}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-transparent border border-white text-white font-semibold hover:bg-white hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;