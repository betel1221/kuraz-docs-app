// src/components/MarkdownEditor.jsx
import React from 'react';

function MarkdownEditor({ content, onContentChange, isDarkMode }) {
  const handleChange = (event) => {
    onContentChange(event.target.value);
  };

  return (
    <div className={`flex-1 p-4 border-r ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'} overflow-y-auto`}>
      <textarea
        className={`w-full h-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none
          ${isDarkMode ? 'bg-gray-900 text-gray-100 border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}
        `}
        placeholder="Start writing your document in Markdown..."
        value={content}
        onChange={handleChange}
      ></textarea>
    </div>
  );
}

export default MarkdownEditor;  