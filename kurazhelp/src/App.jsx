// src/App.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MarkdownEditor from './components/MarkdownEditor';
import PreviewPane from './components/PreviewPane';
import ChatPanel from './components/ChatPanel';
import AuthForm from './components/AuthForm';
import WelcomePage from './components/WelcomePage'; // Import the new WelcomePage
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
import { callGroqAI } from './services/groqService.js';
import './index.css';

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
  const [isSettingsMenuOpen, setIsSettingsMenu] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [authMode, setAuthMode] = useState(null); // New state to track if we're in 'login' or 'signup' mode

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('kurazTheme');
    return savedTheme === 'light' ? false : true;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedSidebarState = localStorage.getItem('kurazSidebarOpen');
    return savedSidebarState === 'false' ? false : true;
  });

  const [isMobilePreview, setIsMobilePreview] = useState(false);

  useEffect(() => {
    localStorage.setItem('kurazTheme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('kurazSidebarOpen', isSidebarOpen);
  }, [isSidebarOpen]);

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
      console.error("Error updating document content:", error);
    }
  };

  const handleUpdateDocTitle = async (id, newTitle) => {
    const trimmedTitle = newTitle.trim();
    if (!currentUser || !id || trimmedTitle === '') {
      console.warn("Cannot update document title: missing user, ID, or title is empty.");
      return;
    }
    const docRef = doc(db, 'users', currentUser.uid, 'documents', id);
    const updatedData = {
      title: trimmedTitle,
      lastEdited: new Date().toISOString(),
    };
    try {
      await updateDoc(docRef, updatedData);
    } catch (error) {
      console.error("Error updating document title:", error);
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
    if (window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
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

  const handleAIMessage = async (message, mode = 'chat') => {
    setIsAILoading(true);
    const documentContent = activeDocument?.content || '';
    const companyInfo = `
      Kuraz Technologies PLC (Kuraztech) is a privately owned company headquartered in Addis Ababa, Ethiopia.
      Mission: Thriving for the next level of learning experience, providing Information and Communication technologies to the education sector.
      Known for: Providing best-in-class web application products to increase the efficiency of Ethiopian students and professionals.
      Name Origin: "Kuraz" was once a lamp in Ethiopia, symbolizing light and transformation from darkness to light, especially for educated Ethiopians from rural areas. Kuraztech aims to be this light for Ethiopia's technology.
      Main Product: Kuraztech Learning Management System (Kuraz LMS) - a software/web-based technology for organizing, carrying out, and evaluating learning activities.
      Account Creation: Required to study, can use email, Facebook, Github, or Twitter accounts.
      Course Cost: Estimated cost per course, but currently all are 100% discounted or free for a limited time.
      Certificates: Provided upon course completion.
      Access: Available via website (https://kuraztech.com), Android, and iOS mobile applications.
      Content Types: Users can read books, blogs, or participate in classes.
      Payment Methods: 4 ways including Telebirr & Chapa. Accepts payments from over 10 banks, PayPal, and credit cards for international transactions.
      Contact Sales: sales@kuraztech.com, +251 995 45 45 46
      Contact Info: info@kuraztech.com, +251 922 633 919
      Support Issues: support@kuraztech.com, +251 995 45 45 46

      Terms and Conditions (summarized key points):
      - Welcome to https://kuraztech.com.
      - By accessing, you accept these terms.
      - Uses cookies as per Privacy Policy for user details and website functionality.
      - Kuraz Technologies PLC owns intellectual property rights for all material on https://kuraztech.com.
      - Users must not republish, sell, rent, sub-license, reproduce, duplicate, copy, or redistribute content without permission.
      - Comments: Users can post comments, but Kuraz Technologies PLC is not responsible for their content. The company reserves the right to monitor and remove inappropriate comments. Users warrant they have rights to post comments and that comments do not infringe on intellectual property or contain unlawful material. Users grant Kuraz Technologies PLC a non-exclusive license to use, reproduce, edit their comments.
      - Hyperlinking: Government agencies, search engines, news organizations, online directory distributors, and system-wide accredited businesses can link without prior approval if links are not deceptive and do not imply false sponsorship. Other organizations (consumer/business info, community sites, charities, portals, accounting/law/consulting firms, educational institutions, trade associations) may be approved based on certain criteria.
      - No use of Kuraz Technologies PLC's logo or artwork for linking without trademark license.
      - iFrames: Not allowed without prior approval and written permission.
      - Content Liability: Kuraz Technologies PLC is not responsible for content appearing on linked websites. Users agree to protect and defend Kuraz Technologies PLC against claims related to content on their website.
      - Privacy: Refers to Privacy Policy.
      - Reserve Rights: Kuraz Technologies PLC reserves the right to request removal of links and to amend terms and conditions at any time.
      - Disclaimer: Information on the website is not guaranteed to be correct, complete, or accurate, and the website's availability or updated material is not warranted. Kuraz Technologies PLC is not liable for loss or damage as long as services are free of charge, with specific limitations for death/personal injury or fraud.
    `;
    let grokMessages = [...chatMessages];
    if (grokMessages.length === 0 || (grokMessages.length > 0 && grokMessages[0].role !== 'system')) {
      grokMessages.unshift({
        role: "system",
        content: `You are KurazHelp, a highly intelligent and helpful AI assistant designed to assist users with document editing and provide information about Kuraz Technologies PLC and its Kuraztech LMS. Your primary purpose is to enhance user productivity by offering summarization, translation, grammar correction, code generation, code explanation, and general chat capabilities. When asked about Kuraz Technologies or Kuraztech LMS, use the provided company information. Be concise, accurate, and always ready to assist with a positive and professional demeanor.`
      });
    }
    let contentForGroqAPI = message.trim();
    grokMessages.push({ role: "system", content: `Here is relevant information about Kuraz Technologies PLC and Kuraztech LMS: ${companyInfo}` });
    if (mode === 'summarizer') {
      grokMessages.push({ role: "system", content: "You are in Summarizer Mode. Your task is to provide a concise and accurate summary of the provided document content. Focus on key ideas and main points. Do not elaborate or act as a general chatbot in this mode unless explicitly asked about Kuraztech related to the document. If the document content is empty, attempt to summarize the user's message itself in the context of Kuraztech if applicable." });
      contentForGroqAPI = `Summarize the following document content (if available, otherwise summarize the user's request): \n\n${documentContent || message}`;
      if (message.trim() && message.toLowerCase() !== 'summarize' && documentContent) {
        contentForGroqAPI += `\n\nAlso consider this user's specific request for summarization: ${message}`;
      } else if (message.trim() && !documentContent) {
        contentForGroqAPI = `Summarize the user's request, considering it might be about Kuraztech: ${message}`;
      }
    } else if (mode === 'translator') {
      grokMessages.push({ role: "system", content: "You are in Translator Mode. Your task is to accurately translate the provided document content or user's request into the requested language. Maintain context and nuance as much as possible. If the document content is empty, translate the user's message." });
      const targetLanguage = message.trim() && message.toLowerCase() !== 'translate' ? message : 'English';
      contentForGroqAPI = `Translate the following content into ${targetLanguage}:\n\n${documentContent || message}`;
    } else if (mode === 'faq') {
      grokMessages.push({ role: "system", content: "You are in FAQ Generator Mode. Your task is to generate relevant and helpful Frequently Asked Questions (FAQs) and their answers based on the provided document content OR based on the Kuraztech company information if the document is empty. Aim for clarity and comprehensive answers." });
      contentForGroqAPI = `Generate FAQs based on the following content: \n\n${documentContent || companyInfo}\n\nUser's specific request: ${message}`;
    } else if (mode === 'grammar_correct') {
      grokMessages.push({ role: "system", content: "You are in Grammar Check Mode. Your task is to review the provided text for grammar, spelling, punctuation, and style errors. Provide the corrected version clearly, and briefly explain significant changes if necessary. Do not add new content beyond corrections." });
      contentForGroqAPI = `Review and correct the following text for grammar, spelling, punctuation, and style. Provide the corrected version. Original text:\n\n${documentContent || message}`;
    } else if (mode === 'code_generate') {
      grokMessages.push({ role: "system", content: "You are in Code Generator Mode. Your task is to provide clear, concise, and working code snippets based on the user's request. Specify the programming language if not explicitly stated. Wrap code in markdown code blocks (```language\\n...\\n```). Do not generate code related to Kuraztech internal systems, only general programming tasks." });
      contentForGroqAPI = `Generate code based on the following request: ${message}`;
    } else if (mode === 'code_explain') {
      grokMessages.push({ role: "system", content: "You are in Code Explainer Mode. Your task is to provide clear and concise explanations for code snippets. Break down complex parts and explain the overall functionality. Assume the user is a developer. Do not explain Kuraztech's internal code." });
      contentForGroqAPI = `Explain the following code snippet:\n\n\`\`\`\n${message}\n\`\`\`\n\nProvide a clear and concise explanation.`;
    } else if (mode === 'copy_edit') {
      grokMessages.push({
        role: "system",
        content: "You are in Copy Edit Mode. Your task is to act as a professional copy editor. Review the provided text for clarity, conciseness, grammar, spelling, punctuation, style, and flow. Improve sentence structure and word choice. Provide the polished, revised version. Do not add new content or change the core meaning. If you make significant changes, you may briefly highlight the type of edits made. When applicable, consider the tone and style of Kuraz Technologies PLC as described in its company information."
      });
      contentForGroqAPI = `Please copy edit and refine the following text for improved clarity, conciseness, style, and grammar:\n\n${documentContent || message}`;
      if (message.trim() && message.toLowerCase() !== 'copy edit' && message.toLowerCase() !== 'copy_edit') {
        contentForGroqAPI += `\n\nUser's specific instruction: ${message}`;
      }
    } else {
      grokMessages.push({
        role: "system",
        content: `You are in general Chat Mode. Engage in natural conversation. If the user asks about Kuraz Technologies PLC or Kuraztech LMS, use the detailed company information provided to give accurate and helpful answers. Otherwise, respond to general queries as a helpful AI assistant. Always prioritize providing information about Kuraztech when relevant to the user's question. If the user's query is directly about the current document, prioritize that.`
      });
      contentForGroqAPI = message.trim();
    }
    if (!contentForGroqAPI || contentForGroqAPI.trim().length === 0) {
      console.warn("Attempted to send an empty or whitespace-only message to AI. Aborting API call.");
      setIsAILoading(false);
      setChatMessages(prevMessages => [...prevMessages, { role: 'assistant', content: "It looks like your request was empty. Please provide some text or a valid request for the AI." }]);
      return;
    }
    grokMessages.push({ role: "user", content: contentForGroqAPI });
    setChatMessages(prevMessages => [...prevMessages, { role: 'user', content: message }]);
    let aiResponseText = '';
    try {
      const response = await callGroqAI(grokMessages);
      if (response.success) {
        aiResponseText = response.aiResponse;
        setChatMessages(prevMessages => [...prevMessages, { role: 'assistant', content: aiResponseText }]);
      } else {
        console.error("KurazHelp AI API Call Error:", response.error);
        aiResponseText = `Error from KurazHelp AI: ${response.error.message || response.error}`;
        setChatMessages(prevMessages => [...prevMessages, { role: 'assistant', content: aiResponseText }]);
      }
    } catch (error) {
      aiResponseText = `An unexpected error occurred while contacting KurazHelp AI: ${error.message}`;
      console.error("Unexpected KurazHelp AI Error:", error);
      setChatMessages(prevMessages => [...prevMessages, { role: 'assistant', content: aiResponseText }]);
    } finally {
      setIsAILoading(false);
    }
  };

  const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeChatPanel = () => setIsChatPanelOpen(false);

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-yellow-400 text-2xl">
        Loading authentication...
      </div>
    );
  }

  // --- NEW LOGIC FOR WELCOME PAGE ---
  if (!currentUser && !authMode) {
    return <WelcomePage onStart={setAuthMode} />;
  }

  if (!currentUser && authMode) {
    return <AuthForm initialMode={authMode} />;
  }
  // --- END OF NEW LOGIC ---

  if (loadingDocs) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-yellow-400 text-2xl">
        Loading your documents...
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className={`flex h-screen items-center justify-center flex-col ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'light bg-gray-100 text-gray-900'}`}>
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

  if (!activeDocument) {
    return (
      <div className={`flex h-screen items-center justify-center flex-col ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'light bg-gray-100 text-gray-900'}`}>
        <p className="mb-4 text-lg">No active document selected or available.</p>
        <p className="text-sm mt-2">Please select a document from the sidebar.</p>
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-sans ${isDarkMode ? 'dark' : 'light'} relative`}>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <div className={`
        fixed top-0 left-0 h-full z-50
        lg:static lg:h-auto lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:w-64 w-64
      `}>
        <Sidebar
          documents={documents}
          activeDocId={activeDocId}
          onSelectDoc={(id) => {
            setActiveDocId(id);
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
          onNewDoc={handleNewDocument}
          onDeleteDoc={handleDeleteDocument}
          onUpdateDocTitle={handleUpdateDocTitle}
          isSidebarOpen={isSidebarOpen}
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className={`p-3 flex items-center justify-between border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
          <div className="flex items-center text-sm min-w-0">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 lg:hidden ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-300'}`}
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden md:flex items-center text-sm">
              <span className={`ml-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Words: {activeDocument.wordCount}</span>
              <span className={`ml-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Edited: {new Date(activeDocument.lastEdited).toLocaleTimeString()}</span>
            </div>
            
            <h1 className={`text-xl font-bold ml-4 truncate max-w-xs ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} hidden md:block`}>
              {activeDocument.title}
            </h1>
            
            <h1 className={`flex-1 min-w-0 text-lg font-bold ml-4 truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} block md:hidden`}>
              {activeDocument.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <div className="md:hidden flex space-x-2">
              <button
                onClick={() => setIsMobilePreview(false)}
                className={`p-2 rounded-lg text-sm font-semibold transition-colors
                  ${isMobilePreview 
                      ? (isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-300')
                      : (isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-600 text-white')
                  }`}
              >
                Editor
              </button>
              <button
                onClick={() => setIsMobilePreview(true)}
                className={`p-2 rounded-lg text-sm font-semibold transition-colors
                  ${isMobilePreview
                      ? (isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-600 text-white')
                      : (isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-300')
                  }`}
              >
                Preview
              </button>
            </div>
          
            <div className="relative">
              <button
                onClick={() => setIsSettingsMenu(!isSettingsMenuOpen)}
                className={`p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-300'}`}
                title="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {isSettingsMenuOpen && (
                <SettingsMenu
                  currentUser={currentUser}
                  onClose={() => setIsSettingsMenu(false)}
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              )}
            </div>
            <button
              onClick={() => setIsChatPanelOpen(!isChatPanelOpen)}
              className={`p-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-300'}`}
              title={isChatPanelOpen ? "Hide AI Chat" : "Show AI Chat"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`flex flex-1 overflow-hidden ${isChatPanelOpen ? 'lg:flex' : 'flex'}`}>
          <div className={`${isMobilePreview ? 'hidden md:flex flex-1' : 'flex-1'} flex`}>
            <MarkdownEditor
              content={activeDocument.content}
              onContentChange={handleContentChange}
              isDarkMode={isDarkMode}
            />
          </div>
          <div className={`${isMobilePreview ? 'flex-1' : 'hidden md:flex flex-1'} flex`}>
            <PreviewPane
              content={activeDocument.content}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {isChatPanelOpen && (
        <div className="fixed top-0 right-0 h-full w-full lg:static lg:h-auto lg:w-80 z-40">
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleAIMessage}
            isDarkMode={isDarkMode}
            isAILoading={isAILoading}
            onClose={closeChatPanel}
          />
        </div>
      )}
    </div>
  );
}

export default App;