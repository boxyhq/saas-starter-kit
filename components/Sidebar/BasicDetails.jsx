/* eslint-disable i18next/no-literal-string */
import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Form, FloatingLabel } from 'react-bootstrap';
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import { convertToHTML } from 'draft-convert';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './BasicDetails.module.css';
import RichEditor from '../SharedComponent/RichEditor.component';

const BasicDetails = ({
  formData,
  setFormData,
  handleInputChange,
  handleAboutChange,
  onBack,
}) => {
  const [key, setKey] = useState('contacts');

  useEffect(() => {
    if (formData.aboutModal) {
      /* empty */
    }
  }, [formData.about]);

  const handleAboutContentChange = (formDataChange) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      about: {
        ...prevFormData.about,
        content: formDataChange,
      },
    }));
  };

  const handleAboutTitleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      about: {
        ...prevFormData.about,
        [name]: value,
      },
    }));
  };

  return (
    <div className="basic-details">
      <h2
        className="back-title mb-5"
        style={{ cursor: 'pointer' }}
        onClick={onBack}
      >
        &larr; Basic details
      </h2>
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3 mt-5"
      >
        <Tab eventKey="contacts" title="Contacts">
          <Form>
            <Form.Group controlId="formName">
              <FloatingLabel
                controlId="floatingInput"
                label="Name"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={formData.name || 'name'}
                  name="name"
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="formTitle">
              <FloatingLabel
                controlId="floatingInput"
                label="Title"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  placeholder="Enter title"
                  value={formData.title | 'name'}
                  name="title"
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="formEmail">
              <FloatingLabel
                controlId="floatingInput"
                label="Email"
                className="mb-3"
              >
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  name="email"
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="formWebsiteUrl">
              <FloatingLabel
                controlId="floatingInput"
                label="Website Url"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  placeholder="Enter website URL"
                  value={formData.websiteUrl}
                  name="websiteUrl"
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="formPhone">
              <FloatingLabel
                controlId="floatingInput"
                label="Phone"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  name="phone"
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            </Form.Group>
          </Form>
        </Tab>
        <Tab eventKey="links" title="Links">
          <Form>
            <Form.Group controlId="formLinkedIn">
              <FloatingLabel
                controlId="floatingInput"
                label="LinkedIn"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  placeholder="LinkedIn"
                  value={formData.linkedin}
                  name="linkedin"
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="formTwitter">
              <FloatingLabel
                controlId="floatingInput"
                label="Twitter"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  placeholder="Twitter"
                  value={formData.twitter}
                  name="twitter"
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="formGithub">
              <FloatingLabel
                controlId="floatingInput"
                label="Github"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  placeholder="Enter Github URL"
                  value={formData.github}
                  name="github"
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            </Form.Group>
            <Form.Group controlId="formHackerrank">
              <FloatingLabel
                controlId="floatingInput"
                label="Hackerrank"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  placeholder="Hackerrank"
                  value={formData.hackerrank}
                  name="hackerrank"
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            </Form.Group>
          </Form>
        </Tab>
        <Tab eventKey="about" title="About">
          <div className="bg-white pb-5">
            <Form className="aboutSummary">
              <Form.Group controlId="formAbout">
                {/* <Form.Label className="p-2 mt-3 form-label">About</Form.Label> */}
                <Form.Group controlId="About">
                  <FloatingLabel
                    controlId="floatingInput"
                    label="Enter Title"
                    className="mb-3 extra-padding"
                  >
                    <Form.Control
                      type="text"
                      placeholder="Enter Title"
                      value={formData.about?.title || ''}
                      name="title"
                      onChange={handleAboutTitleChange}
                      className="aboutSummary"
                    />
                  </FloatingLabel>
                </Form.Group>
                <div className="m-2">
                  <RichEditor
                    initialData={formData.about?.content || 'Normal Data'}
                    handleDataChange={handleAboutContentChange}
                    showCustomButtons={true}
                  />
                </div>
              </Form.Group>
            </Form>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default BasicDetails;
