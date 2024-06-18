import React, { useState, useEffect, useRef } from "react";
import { EditorState, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { convertToHTML } from "draft-convert";
import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import SuggestedPhrasesButton from "./SharedButton.component";
const RichEditor = ({ value, onChange, showCustomButtons }) => {
  const initialContent = value;
  const [editorState, setEditorState] = useState(() =>{
    const contentState = ContentState.createFromText(initialContent);
    return EditorState.createWithContent(contentState);
  });
  

  function handleChange(newEditorState) {
    const html = convertToHTML(newEditorState.getCurrentContent());
    onChange(html);
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
                <SuggestedPhrasesButton />,
              ]
            : []
        }
        toolbar={{
          options: ["inline","history"],
        }}
      />
    </div>
  );
};

export default RichEditor;
