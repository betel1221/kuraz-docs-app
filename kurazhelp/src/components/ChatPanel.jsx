// src/components/ChatPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

function ChatPanel({ messages, onSendMessage, isDarkMode }) { // NEW: isDarkMode prop
  const [inputValue, setInputValue] = useState('');
  const [aiMode, setAiMode] = useState('chat');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue, aiMode);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getModeTitle = () => {
    switch (aiMode) {
      case 'summarizer': return 'Summarizer Mode';
      case 'translator': return 'Translator Mode';
      case 'faq': return 'FAQ Generator Mode';
      default: return 'AI Chat Mode';
    }
  };

  return (
    <div className={`w-80 p-4 flex flex-col min-h-screen border-l
      ${isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-gray-200 text-gray-800 border-gray-300'}
    `}>
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{getModeTitle()}</h2>

      {/* Chat Messages Display */}
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 mb-4">
        {messages.length === 0 ? (
          <p className={`text-sm italic text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Ask KurazHelp AI anything about your document!
            <br/><br/>
            Use the buttons below to switch AI modes, or just type your question.
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`
                p-3 rounded-lg mb-2 text-sm max-w-[85%]
                ${msg.sender === 'user'
                  ? (isDarkMode ? 'bg-yellow-800 bg-opacity-30 self-end ml-auto text-yellow-100' : 'bg-yellow-200 self-end ml-auto text-yellow-800')
                  : (isDarkMode ? 'bg-gray-700 mr-auto text-gray-100' : 'bg-gray-300 mr-auto text-gray-800')}
              `}
            >
              <p className={`font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                {msg.sender === 'ai' ? 'AI:' : 'You:'}
              </p>
              <ReactMarkdown className={`prose prose-sm max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                {msg.text}
              </ReactMarkdown>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex mb-3">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Enter your message or command in ${aiMode} mode...`}
          rows={1}
          className={`flex-grow p-2 rounded-l focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none overflow-hidden
            ${isDarkMode ? 'bg-gray-700 text-gray-100 placeholder-gray-400' : 'bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-300'}
          `}
          style={{ minHeight: '40px', maxHeight: '100px' }}
        ></textarea>
        <button
          onClick={handleSend}
          className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-r focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          Send
        </button>
      </div>

      {/* AI Mode Selection Buttons */}
      <div className="flex justify-around text-sm gap-1">
        <button
          onClick={() => setAiMode('chat')}
          className={`px-2 py-1 rounded flex-1 ${aiMode === 'chat'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setAiMode('summarizer')}
          className={`px-2 py-1 rounded flex-1 ${aiMode === 'summarizer'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          Summarize
        </button>
        <button
          onClick={() => setAiMode('translator')}
          className={`px-2 py-1 rounded flex-1 ${aiMode === 'translator'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          Translate
        </button>
        <button
          onClick={() => setAiMode('faq')}
          className={`px-2 py-1 rounded flex-1 ${aiMode === 'faq'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          FAQ
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;