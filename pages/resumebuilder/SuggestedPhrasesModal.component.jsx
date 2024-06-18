import React, { useContext, useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { EditorState, Modifier, ContentState, convertFromHTML } from "draft-js";
import { convertToHTML } from "draft-convert";
import RichEditor from "./RichEditor.component";
import ResumeContext from "./Context/ResumeContext";

const SuggestedPhrasesModal = ({ show, handleClose, handleAboutChange }) => {
  const phrases = ["Phrase 1", "Phrase 2", "Phrase 3"];
  const { formData } = useContext(ResumeContext);
  const [addedPhrases, setAddedPhrases] = useState(formData.about);

  useEffect(() => {
    if (formData.aboutModal) {
      const blocksFromHTML = convertFromHTML(formData.aboutModal);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [formData.aboutModal]);

  const handleAddPhrase = (phrase) => {
    setAddedPhrases([...addedPhrases, phrase]);
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const newContentState = Modifier.insertText(
      contentState,
      selectionState,
      phrase + "\n"
    );
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "insert-characters"
    );
    setEditorState(newEditorState);
    const updatedAbout = convertToHTML(newEditorState.getCurrentContent());
    setFormData({ ...formData, aboutModal: updatedAbout });
    handleAboutChange(updatedAbout);
  };



  const handleRemovePhrase = (phrase) => {
    setAddedPhrases(addedPhrases.filter((p) => p !== phrase));
    const contentState = editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap().map((block) => {
      const text = block.getText();
      if (text.includes(phrase)) {
        const updatedText = text.replace(phrase, "").trim();
        return block.set("text", updatedText);
      }
      return block;
    });

    const newContentState = contentState.merge({
      blockMap: blockMap,
      selectionAfter: contentState.getSelectionAfter(),
    });

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "remove-range"
    );
    setEditorState(newEditorState);
    const updatedAbout = convertToHTML(newEditorState.getCurrentContent());
    setFormData({ ...formData, aboutModal: updatedAbout });
    handleAboutChange(updatedAbout);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Suggested Phrases</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="row">
            <div className="col-md-5">
              <ul className="content-ul">
                {phrases.map((phrase, index) => (
                  <li key={index}>
                    <span
                      className="btn-plus"
                      onClick={() =>
                        addedPhrases.includes(phrase)
                          ? handleRemovePhrase(phrase)
                          : handleAddPhrase(phrase)
                      }
                    >
                      {addedPhrases.includes(phrase) ? "-" : "+"}
                    </span>
                    {phrase}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-7">
              <RichEditor
                editorState={editorState}
                setEditorState={setEditorState}
                onChange={handleAboutChange}
                showCustomButtons={false}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SuggestedPhrasesModal;
