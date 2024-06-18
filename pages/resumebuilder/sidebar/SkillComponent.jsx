import React, { useState } from "react";
import { Accordion, Button } from "react-bootstrap";
import LanguagesComponent from "./LanguagesComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import FrameworksComponent from "./FrameworksComponent";

const SkillComponent = ({ onBack }) => {
  const [showLanguages, setShowLanguages] = useState(true);
  const [languageEnabled, setLanguageEnabled] = useState(true);
  const [showFrameworks, setShowFrameworks] = useState(true); 

  const EyeIcon = ({ show }) => {
    return show ? (
      <FontAwesomeIcon icon={faEye} />
    ) : (
      <FontAwesomeIcon icon={faEyeSlash} />
    );
  };

  const toggleLanguage = () => {
    setShowLanguages(!showLanguages);
    setLanguageEnabled(!showLanguages); // Disable if it's currently shown, enable if it's currently hidden
  };

  return (
    <div>
      <div className="basic-details">
        <h2
          className="back-title mb-5"
          onClick={onBack}
          style={{ cursor: "pointer" }}
        >
          &larr; Skills and expertise
        </h2>
      </div>
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header className="d-flex justify-content-between align-items-center">
            <span className="d-flex flex-grow-1">Languages</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowLanguages(!showLanguages)}
            >
              <EyeIcon show={showLanguages} />
            </Button>
          </Accordion.Header>
          <Accordion.Body>
          <div style={{ cursor: languageEnabled ? 'auto' : 'not-allowed' }}>
            {showLanguages && <LanguagesComponent />}
          </div>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header className="d-flex justify-content-between align-items-center">
            <span className="d-flex flex-grow-1">Frameworks</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFrameworks(!showFrameworks)}
            >
              <EyeIcon show={showLanguages} />
            </Button>
          </Accordion.Header>
          <Accordion.Body>
          <div style={{ cursor: languageEnabled ? 'auto' : 'not-allowed' }}>
           {showFrameworks && <FrameworksComponent />}
          </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

    </div>
  );
};

export default SkillComponent;
