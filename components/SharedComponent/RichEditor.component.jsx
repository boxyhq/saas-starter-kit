// components/RichEditor.js
import React, { useState, useEffect } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { convertToHTML, convertFromHTML } from 'draft-convert';
import dynamic from 'next/dynamic';
import SuggestedPhrasesButton from '../SharedComponent/SharedButton.component';

// Dynamically import the Editor component with SSR disabled
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
);

const RichEditor = ({ initialData, handleDataChange, showCustomButtons }) => {
  const [editorState, setEditorState] = useState(() => {
    if (initialData) {
      const contentState = convertFromHTML(initialData);
      if (contentState) {
        return EditorState.createWithContent(contentState);
      }
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    if (initialData) {
      const contentState = convertFromHTML(initialData);
      if (contentState) {
        setEditorState(EditorState.createWithContent(contentState));
      }
    } else {
      setEditorState(EditorState.createEmpty());
    }
  }, [initialData]);

  const handleChange = (newEditorState) => {
    const html = convertToHTML(newEditorState.getCurrentContent());
    handleDataChange(html);
    setEditorState(newEditorState);
  };

  return (
    <div>
      <Editor
        editorState={editorState}
        onEditorStateChange={handleChange}
        wrapperClassName="wrapper-class"
        editorClassName="editor-class"
        toolbarClassName="toolbar-class"
        toolbarCustomButtons={
          showCustomButtons
            ? [
                // eslint-disable-next-line react/jsx-key
                <SuggestedPhrasesButton
                  initialData={initialData}
                  handleDataChange={handleDataChange}
                />,
              ]
            : []
        }
        toolbar={{
          options: ['inline', 'blockType', 'list', 'link', 'history'],
          inline: {
            options: ['bold', 'italic', 'underline'],
          },
        }}
      />
    </div>
  );
};

export default RichEditor;
