// components/RichEditor.js
import React, { useState } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { convertToHTML } from 'draft-convert';
import dynamic from 'next/dynamic';
import { Modal, Button } from 'react-bootstrap';
import SuggestedPhrasesButton from '../SharedComponent/SharedButton.component';

// Dynamically import the Editor component with SSR disabled
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
);

const RichEditor = ({ initialData, handleDataChange, showCustomButtons }) => {
  const [editorState, setEditorState] = useState(() => {
    const contentState = ContentState.createFromText(initialData);
    return EditorState.createWithContent(contentState);
  });

  function handleChange(newEditorState) {
    const html = convertToHTML(newEditorState.getCurrentContent());
    handleDataChange(html);
    setEditorState(newEditorState);
  }

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
