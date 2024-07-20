/* eslint-disable i18next/no-literal-string */
import React, { useState, useEffect } from 'react';
import { Form, FloatingLabel } from 'react-bootstrap';
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import { convertToHTML } from 'draft-convert';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './BasicDetails.module.css';
import RichEditor from '../SharedComponent/RichEditor.component';

const Activity = ({ formData, setFormData, onBack }) => {
  const handleEditorChange = (formDataChange) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      activities: {
        ...prevFormData.activities,
        content: formDataChange,
      },
    }));
  };

  const handleActivityTitleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      activities: {
        ...prevFormData.activities,
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
        &larr; Extracurricular Activities, Awards & Certifications
      </h2>
      <div className="bg-white pb-5">
        <Form className="aboutSummary">
          <Form.Group controlId="formAbout">
            <Form.Group controlId="About">
              <FloatingLabel
                controlId="floatingInput"
                label="Enter Title"
                className="mb-3 extra-padding"
              >
                <Form.Control
                  type="text"
                  placeholder="Enter Title"
                  value={formData.activities.title}
                  name="title"
                  onChange={handleActivityTitleChange}
                  className="aboutSummary"
                />
              </FloatingLabel>
            </Form.Group>
            <div className="m-2">
              <RichEditor
                initialValue={formData.activities.content}
                onChange={handleEditorChange}
                showCustomButtons={true}
              />
            </div>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
};

export default Activity;
