// src/components/MarkdownEditor.jsx
import React, { useRef, useEffect } from 'react';

function MarkdownEditor({ content, onContentChange, isDarkMode }) {
  // We use a ref to get a direct reference to the textarea DOM element.
  const textareaRef = useRef(null);

  const handleChange = (event) => {
    // 1. Get the current cursor position and selection before the state update.
    const { selectionStart, selectionEnd } = event.target;

    // 2. Call the parent function to update the content state.
    onContentChange(event.target.value);

    // 3. Store the selection to be restored after the re-render.
    // We use an attribute on the ref to persist this value between renders.
    textareaRef.current.selection = { selectionStart, selectionEnd };
  };

  // useEffect runs after the component has been rendered.
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.selection) {
      // 4. Restore the cursor position and selection from the stored values.
      const { selectionStart, selectionEnd } = textareaRef.current.selection;
      textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
      
      // 5. Clean up the stored selection to avoid side effects.
      textareaRef.current.selection = null;
    }
  }, [content]); // This effect runs whenever the content prop changes.

  return (
    <div className={`flex-1 p-4 border-r ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'} overflow-y-auto`}>
      <textarea
        ref={textareaRef} // Attach the ref to the textarea element.
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