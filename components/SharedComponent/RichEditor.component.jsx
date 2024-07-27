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
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    if (initialData) {
      const contentState = convertFromHTML(initialData);
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [initialData]);

  const onEditorStateChange = (newState) => {
    setEditorState(newState);
    const content = newState.getCurrentContent();
    handleDataChange(convertToHTML(content));
  };

  return (
    <Editor
      defaultEditorState={editorState}
      onEditorStateChange={onEditorStateChange}
      wrapperClassName="wrapper-class"
      editorClassName="editor-class"
      toolbarClassName="toolbar-class"
      toolbarCustomButtons={
        showCustomButtons
          ? [
              // eslint-disable-next-line react/jsx-key
              <SuggestedPhrasesButton
                initialData={initialData}
                defaultEditorState={initialData}
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
  );
};

export default RichEditor;
