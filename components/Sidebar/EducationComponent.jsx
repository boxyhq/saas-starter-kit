/* eslint-disable i18next/no-literal-string */
import React, { useContext, useEffect, useState } from 'react';
import { Accordion, Button, FloatingLabel, Form } from 'react-bootstrap';
import ResumeContext from '../Context/ResumeContext';
import { FaTrash } from 'react-icons/fa';

const EducationComponent = ({ onBack }) => {
  const { formData, setFormData } = useContext(ResumeContext);
  const [educationData, setEducationData] = useState({});

  useEffect(() => {
    if (formData.educationData) {
      setEducationData(formData.educationData);
    }
  }, []);

  const handleChangeEducation = (e) => {
    const { name, value, id, checked, type } = e.target;
    const educationTitleIndex = id.replace(/\D+/g, ''); // extract the number from the id
    const educationTitleKey = `educationTitles${educationTitleIndex}`;

    setEducationData((prevEducationData) => ({
      ...prevEducationData,
      [educationTitleKey]: {
        ...prevEducationData[educationTitleKey],
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  };

  const handleDeleteEducation = (index) => {
    setEducationData((prevEducationData) => {
      const newEducationData = { ...prevEducationData };
      delete newEducationData[`educationTitles${index + 1}`];

      // Reindex keys after deletion
      const reorderedEducationData = {};
      Object.keys(newEducationData).forEach((key, i) => {
        reorderedEducationData[`educationTitles${i + 1}`] =
          newEducationData[key];
      });

      return reorderedEducationData;
    });
  };

  const handleEducationClick = (e) => {
    e.preventDefault();
    const newCount = Object.keys(educationData).length + 1;
    const newKey = `educationTitles${newCount}`;
    setEducationData((prevEducationData) => ({
      ...prevEducationData,
      [newKey]: {},
    }));
  };

  const createEducationTemplate = (i, education) => (
    <Accordion.Item key={i} eventKey={i}>
      <Accordion.Header className="d-flex justify-content-between align-items-center accordion-items">
        <span className="d-flex flex-grow-1">Education {i}</span>
        <FaTrash
          className="delete-icon"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteEducation(i - 1);
          }}
        />
      </Accordion.Header>
      <Accordion.Body>
        <Form>
          <Form.Group>
            <FloatingLabel label="School or College Name" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter school name"
                id={`school${i}`}
                name="school"
                value={education.school || ''}
                onChange={handleChangeEducation}
              />
            </FloatingLabel>
          </Form.Group>
          <Form.Group>
            <FloatingLabel label="Degree" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter degree"
                id={`degree${i}`}
                name="degree"
                value={education.degree || ''}
                onChange={handleChangeEducation}
              />
            </FloatingLabel>
          </Form.Group>
          <Form.Group>
            <FloatingLabel label="Area" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter area of study"
                id={`area${i}`}
                name="area"
                value={education.area || ''}
                onChange={handleChangeEducation}
              />
            </FloatingLabel>
          </Form.Group>
          <Form.Group>
            <FloatingLabel label="Grade" className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter grade"
                id={`grade${i}`}
                name="grade"
                value={education.grade || ''}
                onChange={handleChangeEducation}
              />
            </FloatingLabel>
          </Form.Group>
          <Form.Group>
            <FloatingLabel label="Start Date" className="mb-3">
              <Form.Control
                type="date"
                id={`startDate${i}`}
                name="startDate"
                value={education.startDate || ''}
                onChange={handleChangeEducation}
              />
            </FloatingLabel>
          </Form.Group>
          <Form.Group>
            <FloatingLabel label="End Date" className="mb-3">
              <Form.Control
                type="date"
                id={`endDate${i}`}
                name="endDate"
                value={education.endDate || ''}
                onChange={handleChangeEducation}
              />
            </FloatingLabel>
          </Form.Group>
          <Form.Group>
            <Form.Check
              type="switch"
              label="I currently study here"
              id={`currentlyStudying${i}`}
              name="currentlyStudying"
              checked={education.currentlyStudying || false}
              onChange={handleChangeEducation}
            />
          </Form.Group>
        </Form>
      </Accordion.Body>
    </Accordion.Item>
  );

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      educationData,
    }));
  }, [educationData, setFormData]);

  return (
    <div className="basic-details">
      <h2
        className="back-title mb-5"
        onClick={onBack}
        style={{ cursor: 'pointer' }}
      >
        &larr; Education
      </h2>
      <div>
        <Accordion defaultActiveKey="0">
          {Object.keys(educationData).map((key, index) =>
            createEducationTemplate(index + 1, educationData[key])
          )}
        </Accordion>
        <Button variant="primary" onClick={handleEducationClick}>
          Add More Education
        </Button>
      </div>
    </div>
  );
};

export default EducationComponent;
