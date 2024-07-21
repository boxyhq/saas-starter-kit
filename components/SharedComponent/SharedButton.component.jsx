/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import SuggestedPhrasesModal from './SuggestedPhrasesModal.component';

const SuggestedPhrasesButton = ({ initialData, handleDataChange }) => {
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
        initialData={initialData}
        handleDataChange={handleDataChange}
        // initialData, show, handleClose, handleDataChange
        handleClose={handleClose}
        // addPhrase={addPhrase}
      />
    </>
  );
};

export default SuggestedPhrasesButton;
