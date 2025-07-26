// src/components/Sidebar.jsx
import React, { useState } from 'react';

// If your logo is in /public/logo.png (accessible directly), this works:
const LOGO_PATH = '/logo.png';

function Sidebar({ documents, activeDocId, onSelectDoc, onNewDoc, onDeleteDoc, isSidebarOpen, isDarkMode }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`
      flex flex-col min-h-screen transition-all duration-300 ease-in-out
      ${isSidebarOpen ? 'w-64 p-4' : 'w-16 px-2 py-4 items-center'}
      ${isDarkMode ? 'bg-gray-800 text-gray-200 border-r border-gray-700' : 'bg-gray-200 text-gray-800 border-r border-gray-300'}
      overflow-hidden
    `}>
      {/* Adjust width and padding based on sidebar state */}

      {/* Logo and Title */}
      <div className={`flex items-center mb-6 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
        <img
          src={LOGO_PATH}
          alt="KurazHelp Logo"
          className={`h-8 w-8 transition-all duration-300 ${isSidebarOpen ? 'mr-3' : 'mr-0'}`}
        />
        {isSidebarOpen && (
          <h2 className="text-xl font-semibold text-yellow-400 whitespace-nowrap">Kuraz Docs</h2>
        )}
      </div>

      {isSidebarOpen && (
        <>
          {/* New Document Button */}
          <button
            onClick={onNewDoc}
            className="w-full py-2 mb-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            + New Document
          </button>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search documents..."
            className={`w-full p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500
              ${isDarkMode ? 'bg-gray-700 text-gray-100 placeholder-gray-400' : 'bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-300'}
            `}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </>
      )}

      {/* Document List */}
      <nav className="flex-grow overflow-y-auto custom-scrollbar pr-2">
        {documents.length === 0 && searchTerm === '' ? (
          <p className={`text-sm italic text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            {isSidebarOpen ? 'No documents yet. Click "+ New Document" to create one.' : ''}
          </p>
        ) : filteredDocuments.length > 0 ? (
          <ul>
            {filteredDocuments.map(doc => (
              <li key={doc.id} className="mb-2 group">
                {/* CHANGED FROM <button> TO <div> TO AVOID NESTED BUTTON ERROR */}
                <div
                  onClick={() => onSelectDoc(doc.id)}
                  // Added cursor-pointer for visual feedback that it's clickable
                  className={`
                    flex items-center justify-between w-full p-2 rounded text-left cursor-pointer
                    ${activeDocId === doc.id
                      ? (isDarkMode ? 'bg-gray-700 text-yellow-400 font-bold' : 'bg-gray-300 text-yellow-600 font-bold')
                      : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300')}
                  `}
                  // Added for accessibility so it behaves like a button for keyboard users
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault(); // Prevent default browser scroll/space behavior
                      onSelectDoc(doc.id);
                    }
                  }}
                >
                  {/* React Fragment to group the two conditional elements */}
                  <>
                    {isSidebarOpen ? (
                      <span className="truncate flex-grow mr-2">{doc.title}</span>
                    ) : (
                      <span className="sr-only">{doc.title}</span>
                    )}

                    {isSidebarOpen ? (
                      <button // This is the valid inner button (delete)
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents the div's onClick from firing
                          onDeleteDoc(doc.id);
                        }}
                        className={`
                          text-gray-400 hover:text-red-500 p-1 rounded-full
                          ${activeDocId === doc.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                          transition-opacity duration-200
                        `}
                        title="Delete Document"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.519M15.9 18H5.98A2 2 0 014 16.142V6h16v10.142a2 2 0 01-2 1.858zM6.5 6.75a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zm3 0a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zm3 0a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zM2.25 5.5a.75.75 0 01.75-.75h14.5a.75.75 0 01.75.75v.227c0 1.246-.168 2.47-.487 3.65A10.867 10.867 0 0112 18.75c-2.455 0-4.786-.682-6.863-1.873A10.867 10.867 0 012.25 5.5z" clipRule="evenodd" />
                        </svg>
                      </button>
                    ) : (
                      // Explicitly return null if not active, or the span if it is
                      activeDocId === doc.id ? (
                        <span className="h-2 w-2 bg-yellow-400 rounded-full"></span>
                      ) : null
                    )}
                  </>
                </div> {/* Closing <div> */}
              </li>
            ))}
          </ul>
        ) : (
          // Explicitly return null if search term is empty, or the paragraph if not
          searchTerm !== '' ? (
            <p className={`text-sm italic ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              {isSidebarOpen ? `No documents found matching "${searchTerm}".` : ''}
            </p>
          ) : null
        )}
      </nav>
    </div>
  );
}

export default Sidebar;