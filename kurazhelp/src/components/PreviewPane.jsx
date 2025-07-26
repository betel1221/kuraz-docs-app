// src/components/PreviewPane.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function PreviewPane({ content, isDarkMode }) { // NEW: isDarkMode prop
  return (
    <div className={`flex-1 p-4 overflow-y-auto custom-scrollbar
      ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}
    `}>
      <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}> {/* Apply prose-invert only for dark mode */}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default PreviewPane;