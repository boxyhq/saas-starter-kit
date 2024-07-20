import React, { useContext, useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { EditorState, Modifier, ContentState, convertFromHTML } from 'draft-js';
import { convertToHTML } from 'draft-convert';
import RichEditor from './RichEditor.component';
import ResumeContext from '../Context/ResumeContext';
import { UseDataFetch } from '../../Utils/UseDataFetch';

const SuggestedPhrasesModal = ({
  initialData,
  handleDataChange,
  handleClose,
  show,
}) => {
  const [phrases, setPhrases] = useState([]);
  const [addedPhrases, setAddedPhrases] = useState([]);
  const { data, error } = UseDataFetch('localApi', `/getAboutPhrases`);

  const handleAddPhrase = (phrase) => {
    setAddedPhrases([...addedPhrases, phrase]);
    handleDataChange(initialData + `\n${phrase}`);

    //onChange(convertToHTML(newEditorState.getCurrentContent()));
  };

  const handleRemovePhrase = (phrase) => {
    const newPhrases = addedPhrases.filter((p) => p !== phrase);
    setAddedPhrases(newPhrases);

    // onChange(convertToHTML(newEditorState.getCurrentContent()));
  };

  // Update form data when fetched data changes
  useEffect(() => {
    if (data) {
      setPhrases(data.phrases);
    }
  }, [data]);

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
                    {addedPhrases.includes(phrase) ? (
                      <span
                        className="btn-plus"
                        onClick={() => handleRemovePhrase(phrase)}
                      >
                        -
                      </span>
                    ) : (
                      <span
                        className="btn-plus"
                        onClick={() => handleAddPhrase(phrase)}
                      >
                        +
                      </span>
                    )}
                    {phrase}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-7">
              <RichEditor
                initialData={initialData}
                handleDataChange={handleDataChange}
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
