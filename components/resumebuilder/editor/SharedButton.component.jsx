/* eslint-disable i18next/no-literal-string */
import React, { useContext, useState } from 'react';
import { Button } from 'react-bootstrap';
import SuggestedPhrasesModal from './SuggestedPhrasesModal.component';
import './SharedButton.css';

const SuggestedPhrasesButton = ({ editorState, onChange }) => {
  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  return (
    <>
      <Button className="btn-primary" onClick={handleOpen}>
        Suggested Phrases
      </Button>
      <SuggestedPhrasesModal
        show={showModal}
        handleClose={handleClose}
        onChange={onChange}
      />
    </>
  );
};

export default SuggestedPhrasesButton;
