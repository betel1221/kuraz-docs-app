// src/components/ChatPanel.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

function ChatPanel({ messages, onSendMessage, isDarkMode, isAILoading }) {
  const [inputValue, setInputValue] = useState('');
  const [aiMode, setAiMode] = useState('chat');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isAILoading) {
      onSendMessage(inputValue, aiMode);
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isAILoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text.');
    }
  };

  const getModeTitle = () => {
    switch (aiMode) {
      case 'summarizer': return 'Summarizer Mode';
      case 'translator': return 'Translator Mode';
      case 'faq': return 'FAQ Generator Mode';
      case 'grammar_correct': return 'Grammar Check Mode';
      case 'code_generate': return 'Code Generator Mode';
      case 'code_explain': return 'Code Explainer Mode';
      case 'copy_edit': return 'Copy Edit Mode';
      default: return 'AI Chat Mode';
    }
  };

  return (
    <div className={`w-80 p-4 flex flex-col min-h-screen border-l
      ${isDarkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-gray-200 text-gray-800 border-gray-300'}
    `}>
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{getModeTitle()}</h2>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 mb-4">
        {messages.length === 0 && !isAILoading ? (
          <p className={`text-sm italic text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Ask KurazHelp AI anything about your document!
            <br/><br/>
            Use the buttons below to switch AI modes, or just type your question.
          </p>
        ) : (
          messages.map((msg, index) => {
            if (msg.role === 'system') {
                return null;
            }

            const isUser = msg.role === 'user';
            const messageClass = isUser ? 'self-end ml-auto' : 'self-start mr-auto';
            const bubbleBgClass = isUser
              ? (isDarkMode ? 'bg-yellow-800 bg-opacity-30 text-yellow-100' : 'bg-yellow-200 text-yellow-800')
              : (isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-300 text-gray-800');
            const roleTextClass = isDarkMode ? 'text-yellow-300' : 'text-yellow-700';

            return (
              <div
                key={index}
                className={`flex flex-col mb-2 text-sm max-w-[85%] ${messageClass}`}
              >
                <div
                  className={`
                    p-3 rounded-lg prose prose-sm max-w-none relative
                    ${bubbleBgClass}
                    ${isDarkMode ? 'prose-invert' : ''}
                    group
                  `}
                >
                  <p className={`font-semibold mb-1 ${roleTextClass}`}>
                    {isUser ? 'You:' : 'AI:'}
                  </p>
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>

                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(msg.content)}
                      className={`absolute bottom-1 right-1 p-1 rounded-full
                        ${isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
                        focus:outline-none focus:ring-2 focus:ring-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      `}
                      title="Copy to Clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0V3a1 1 0 011-1h2a1 1 0 011 1v2m-4 0h.01" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        {isAILoading && (
            <div className="flex justify-center my-2">
                <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'}`}>
                    AI is thinking...
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex mb-3">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isAILoading ? "AI is busy..." : `Enter your message or command in ${getModeTitle().replace(' Mode', '').toLowerCase()} mode...`}
          rows={1}
          disabled={isAILoading}
          className={`flex-grow p-2 rounded-l focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none overflow-hidden
            ${isDarkMode ? 'bg-gray-700 text-gray-100 placeholder-gray-400' : 'bg-gray-100 text-gray-800 placeholder-gray-500 border border-gray-300'}
          `}
          style={{ minHeight: '40px', maxHeight: '100px' }}
        ></textarea>
        <button
          onClick={handleSend}
          disabled={isAILoading || !inputValue.trim()}
          className={`bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-r focus:outline-none focus:ring-2 focus:ring-yellow-500
            ${isAILoading || !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          Send
        </button>
      </div>

      <div className="flex justify-around text-sm gap-1 flex-wrap">
        <button
          onClick={() => setAiMode('chat')}
          className={`px-2 py-1 rounded flex-1 min-w-[70px] ${aiMode === 'chat'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setAiMode('summarizer')}
          className={`px-2 py-1 rounded flex-1 min-w-[70px] ${aiMode === 'summarizer'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          Summarize
        </button>
        <button
          onClick={() => setAiMode('translator')}
          className={`px-2 py-1 rounded flex-1 min-w-[70px] ${aiMode === 'translator'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          Translate
        </button>
        <button
          onClick={() => setAiMode('faq')}
          className={`px-2 py-1 rounded flex-1 min-w-[70px] ${aiMode === 'faq'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          FAQ
        </button>
        <button
          onClick={() => setAiMode('grammar_correct')}
          className={`px-2 py-1 rounded flex-1 min-w-[70px] ${aiMode === 'grammar_correct'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          Grammar
        </button>
        <button
          onClick={() => setAiMode('code_generate')}
          className={`px-2 py-1 rounded flex-1 min-w-[70px] ${aiMode === 'code_generate'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          Code Gen
        </button>
        <button
          onClick={() => setAiMode('code_explain')}
          className={`px-2 py-1 rounded flex-1 min-w-[70px] ${aiMode === 'code_explain'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          Code Exp
        </button>
        <button
          onClick={() => setAiMode('copy_edit')}
          className={`px-2 py-1 rounded flex-1 min-w-[70px] ${aiMode === 'copy_edit'
            ? 'bg-yellow-600 text-white'
            : (isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700')
          }`}
        >
          Copy Edit
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;