// src/App.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MarkdownEditor from './components/MarkdownEditor';
import PreviewPane from './components/PreviewPane';
import ChatPanel from './components/ChatPanel';
import AuthForm from './components/AuthForm';
import SettingsMenu from './components/SettingsMenu';

import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

import './index.css';

// Helper function to get word count
const getWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  // NEW: Theme State - Initialize from localStorage or default to true (dark)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('kurazTheme');
    return savedTheme === 'light' ? false : true; // Default to dark if no preference
  });

  // NEW: Sidebar State - Initialize from localStorage or default to true (open)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedSidebarState = localStorage.getItem('kurazSidebarOpen');
    return savedSidebarState === 'false' ? false : true; // Default to open
  });

  // Effect to save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('kurazTheme', isDarkMode ? 'dark' : 'light');
    // Apply theme classes to the body or root element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Effect to save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('kurazSidebarOpen', isSidebarOpen);
  }, [isSidebarOpen]);


  // Firebase Auth State Observer and Firestore Document Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);

      let unsubscribeFirestore = () => {};

      if (user) {
        setLoadingDocs(true);
        const userDocsCollectionRef = collection(db, 'users', user.uid, 'documents');
        const q = query(userDocsCollectionRef, orderBy('lastEdited', 'desc'));

        unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          const fetchedDocs = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          setDocuments(fetchedDocs);
          setLoadingDocs(false);

          if (fetchedDocs.length > 0) {
              if (!activeDocId || !fetchedDocs.some(doc => doc.id === activeDocId)) {
                  setActiveDocId(fetchedDocs[0].id);
              }
          } else {
              setActiveDocId(null);
          }

        }, (error) => {
          console.error("Error fetching documents:", error);
          setLoadingDocs(false);
        });

      } else {
        setDocuments([]);
        setActiveDocId(null);
        setChatMessages([]);
        setIsChatPanelOpen(false);
      }

      return () => {
        unsubscribeAuth();
        unsubscribeFirestore();
      };
    });
  }, [activeDocId]);

  const activeDocument = documents.find(doc => doc.id === activeDocId);

  const handleContentChange = async (newContent) => {
    if (!currentUser || !activeDocument) return;

    const docRef = doc(db, 'users', currentUser.uid, 'documents', activeDocument.id);
    const updatedData = {
      content: newContent,
      lastEdited: new Date().toISOString(),
      wordCount: getWordCount(newContent),
    };

    try {
      await updateDoc(docRef, updatedData);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleNewDocument = async () => {
    if (!currentUser) return;

    setLoadingDocs(true);
    const newDocData = {
      title: 'Untitled Document ' + (documents.length + 1),
      content: `# New Document\n\nStart writing here...`,
      lastEdited: new Date().toISOString(),
      wordCount: getWordCount(`# New Document\n\nStart writing here...`),
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'documents'), newDocData);
    } catch (error) {
      console.error("Error creating new document:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDeleteDocument = async (idToDelete) => {
    if (!currentUser || !idToDelete) return;

    if (window.confirm("Are you sure you want to delete this document?")) {
      setLoadingDocs(true);
      const docRef = doc(db, 'users', currentUser.uid, 'documents', idToDelete);
      try {
        await deleteDoc(docRef);
      } catch (error) {
        console.error("Error deleting document:", error);
      } finally {
        setLoadingDocs(false);
      }
    }
  };

  const handleSaveDocExplicitly = () => {
    if (activeDocument) {
      alert('Document auto-saves as you type. Explicit save not needed for content. This button could trigger other actions like archiving or publishing.');
    } else {
      alert('No active document to save.');
    }
  };

  const handleAIMessage = (message, mode = 'chat') => {
    setChatMessages(prevMessages => [...prevMessages, { sender: 'user', text: message }]);
    setIsChatPanelOpen(true);

    let aiResponseText = '';
    const content = activeDocument?.content || 'No content available for this action.';

    switch (mode) {
      case 'summarizer':
        aiResponseText = `**Summary of your document:**\n\n"${content.substring(0, Math.min(content.length, 250))}..."\n\n(This is a frontend mock. A real AI would provide a comprehensive summary based on the document content.)`;
        break;
      case 'translator':
        aiResponseText = `**Translation of your document (to Spanish, mock):**\n\n_Original:_ "${content.substring(0, Math.min(content.length, 100))}..."\n\n_Translation:_ "Este es un documento de bienvenida. (This is a frontend mock translation.)"`;
        break;
      case 'faq':
        aiResponseText = `**Mock FAQs for your document:**
1. **Q:** What is this document about?
   **A:** It's a welcome document for KurazHelp AI Docs.
2. **Q:** What are the key features?
   **A:** Rich text editing, AI assistance, and document organization.
3. **Q:** How do I get started?
   **A:** Type in the editor and see the live preview.

(This is a frontend mock. A real AI would generate relevant questions and answers.)`;
        break;
      default:
        aiResponseText = `Hello! I'm your KurazHelp AI. You said: "${message}". I can help with summarizing, translating, or generating FAQs. Try selecting a mode at the bottom of the chat panel!`;
    }

    setTimeout(() => {
      setChatMessages(prevMessages => [...prevMessages, { sender: 'ai', text: aiResponseText }]);
    }, 1000);
  };

  const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode); // NEW: Toggle dark mode

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev); // NEW: Toggle sidebar

  // --- Conditional Rendering based on Auth State & Document Loading ---
  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-yellow-400 text-2xl">
        Loading authentication...
      </div>
    );
  }

  if (!currentUser) {
    return <AuthForm />;
  }

  if (loadingDocs) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-yellow-400 text-2xl">
        Loading your documents...
      </div>
    );
  }

  if (!activeDocument && documents.length === 0) {
    return (
      <div className="flex h-screen bg-gray-900 text-gray-100 items-center justify-center flex-col">
        <p className="mb-4 text-lg">No documents found for your account.</p>
        <button
          onClick={handleNewDocument}
          className="px-6 py-3 rounded bg-yellow-600 hover:bg-yellow-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          Create Your First Document
        </button>
      </div>
    );
  }

  // Main App content for logged-in users with an active document
  return (
    <div className={`flex h-screen font-sans ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'light bg-gray-100 text-gray-900'}`}> {/* Apply theme classes here */}
      {/* Sidebar - Conditional width based on isSidebarOpen */}
      <Sidebar
        documents={documents}
        activeDocId={activeDocId}
        onSelectDoc={setActiveDocId}
        onNewDoc={handleNewDocument}
        onDeleteDoc={handleDeleteDocument}
        isSidebarOpen={isSidebarOpen} // Pass sidebar state
        isDarkMode={isDarkMode} // Pass dark mode state for styling
      >
        {/* AuthStatus functionality moved to SettingsMenu */}
      </Sidebar>

      {/* Main Content Area (Editor + Preview) */}
      <div className="flex flex-1 overflow-hidden flex-col">
        {/* Document Controls & Top Bar */}
        <div className={`p-3 flex items-center justify-between border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
          <div className="flex items-center text-sm">
            {/* NEW: Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-300'}`}
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /> // Hamburger icon
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /> // Hamburger icon
                )}
              </svg>
            </button>
            <span className={`ml-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Words: {activeDocument.wordCount}</span>
            <span className={`ml-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Edited: {new Date(activeDocument.lastEdited).toLocaleTimeString()}</span>
            <h1 className={`text-xl font-bold ml-4 truncate max-w-xs ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{activeDocument.title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* Settings/User Menu Toggle Button */}
            <button
              onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
              className={`p-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-300'}`}
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
             <button
              onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
              className={`p-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-300'}`}
              title={isChatPanelOpen ? "Hide AI Chat" : "Show AI Chat"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
          </div>

          {/* Render SettingsMenu conditionally */}
          {isSettingsMenuOpen && (
            <SettingsMenu
              currentUser={currentUser}
              onClose={() => setIsSettingsMenuOpen(false)}
              isDarkMode={isDarkMode} // Pass theme state
              toggleDarkMode={toggleDarkMode} // Pass theme toggle function
            />
          )}
        </div>

        {/* Editor & Preview */}
        <div className="flex flex-1 overflow-hidden">
          <MarkdownEditor
            content={activeDocument.content}
            onContentChange={handleContentChange}
            isDarkMode={isDarkMode} // Pass theme state
          />
          <PreviewPane
            content={activeDocument.content}
            isDarkMode={isDarkMode} // Pass theme state
          />
        </div>
      </div>

      {isChatPanelOpen && (
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleAIMessage}
          isDarkMode={isDarkMode} // Pass theme state
        />
      )}
    </div>
  );
}

export default App;