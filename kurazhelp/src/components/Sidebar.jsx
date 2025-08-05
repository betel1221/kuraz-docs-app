// src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from 'react';

const LOGO_PATH = '/logo.png';

function Sidebar({ documents, activeDocId, onSelectDoc, onNewDoc, onDeleteDoc, onUpdateDocTitle, isSidebarOpen, isDarkMode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDocId, setEditingDocId] = useState(null);
  const [currentEditTitle, setCurrentEditTitle] = useState('');
  const inputRef = useRef(null);

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (editingDocId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingDocId]);

  const handleEditClick = (e, doc) => {
    e.stopPropagation();
    if (isSidebarOpen) {
      setEditingDocId(doc.id);
      setCurrentEditTitle(doc.title);
    }
  };

  const handleTitleChange = (e) => {
    setCurrentEditTitle(e.target.value);
  };

  const handleSaveTitle = (docId) => {
    if (currentEditTitle.trim() !== '' && currentEditTitle !== documents.find(d => d.id === docId)?.title) {
      onUpdateDocTitle(docId, currentEditTitle.trim());
    }
    setEditingDocId(null);
    setCurrentEditTitle('');
  };

  const handleKeyDown = (e, docId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTitle(docId);
    } else if (e.key === 'Escape') {
      setEditingDocId(null);
      setCurrentEditTitle('');
    }
  };

  return (
    <div className={`
      flex flex-col min-h-screen transition-all duration-300 ease-in-out
      ${isSidebarOpen ? 'w-64 p-4' : 'w-16 px-2 py-4 items-center'}
      ${isDarkMode ? 'bg-gray-800 text-gray-200 border-r border-gray-700' : 'bg-gray-200 text-gray-800 border-r border-gray-300'}
      overflow-hidden
    `}>
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
          <button
            onClick={onNewDoc}
            className="w-full py-2 mb-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            + New Document
          </button>

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

      <nav className="flex-grow overflow-y-auto custom-scrollbar pr-2">
        {documents.length === 0 && searchTerm === '' ? (
          <p className={`text-sm italic text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            {isSidebarOpen ? 'No documents yet. Click "+ New Document" to create one.' : ''}
          </p>
        ) : filteredDocuments.length > 0 ? (
          <ul>
            {filteredDocuments.map(doc => (
              <li key={doc.id} className="mb-2 group">
                <div
                  onClick={() => {
                      if (editingDocId !== doc.id) {
                          onSelectDoc(doc.id);
                      }
                  }}
                  className={`
                    flex items-center justify-between w-full p-2 rounded text-left cursor-pointer
                    ${activeDocId === doc.id
                      ? (isDarkMode ? 'bg-gray-700 text-yellow-400 font-bold' : 'bg-gray-300 text-yellow-600 font-bold')
                      : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300')}
                  `}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (editingDocId !== doc.id) {
                         onSelectDoc(doc.id);
                      }
                    }
                  }}
                >
                  <div className="flex-grow flex items-center mr-2">
                    {isSidebarOpen ? (
                      editingDocId === doc.id ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={currentEditTitle}
                          onChange={handleTitleChange}
                          onBlur={() => handleSaveTitle(doc.id)}
                          onKeyDown={(e) => handleKeyDown(e, doc.id)}
                          className={`flex-grow p-1 rounded
                            ${isDarkMode ? 'bg-gray-600 text-gray-100' : 'bg-white text-gray-900'}
                            focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="truncate" title={doc.title}>
                          {doc.title}
                        </span>
                      )
                    ) : (
                      <span className="sr-only">{doc.title}</span>
                    )}
                  </div>

                  {isSidebarOpen && (
                    <div className="flex items-center space-x-1">
                      {editingDocId !== doc.id && (
                        <button
                          onClick={(e) => handleEditClick(e, doc)}
                          className={`
                            text-gray-400 hover:text-yellow-500 p-1 rounded-full
                            ${activeDocId === doc.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                            transition-opacity duration-200
                          `}
                          title="Edit Document Name"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21.731 2.269a2.25 2.25 0 00-3.182 0l-15 15a2.25 2.25 0 00-.603.96L2.269 19.14a2.25 2.25 0 002.942 2.942l1.91-5.04c.307-1.015.908-1.92 1.76-2.582l15-15a2.25 2.25 0 000-3.182zM15 10.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v3a.75.75 0 00.75.75h3a.75.75 0 00.75-.75v-3z" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDoc(doc.id);
                          setEditingDocId(null);
                          setCurrentEditTitle('');
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
                    </div>
                  )}

                  {!isSidebarOpen && activeDocId === doc.id && (
                    <span className="h-2 w-2 bg-yellow-400 rounded-full"></span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
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