/* eslint-disable i18next/no-literal-string */
import React, { useContext, useEffect, useState } from 'react';
import { Accordion, Button, FloatingLabel, Form } from 'react-bootstrap';
import ResumeContext from '../Context/ResumeContext';
import { FaTrash } from 'react-icons/fa';

const ExperienceComponent = ({ onBack }) => {
  const { formData, setFormData } = useContext(ResumeContext);
  const [experienceData, setExperienceData] = useState({});

  useEffect(() => {
    if (formData.experienceData) {
      setExperienceData(formData.experienceData);
    }
  }, [formData.experienceData]);

  const handleChangeExperience = (e, id) => {
    const { name, value, checked, type } = e.target;

    const updatedExperience = {
      ...experienceData[id],
      [name]: type === 'checkbox' ? checked : value,
    };

    const updatedExperienceData = {
      ...experienceData,
      [id]: updatedExperience,
    };

    setExperienceData(updatedExperienceData);
    updateFormData(updatedExperienceData);
  };

  const handleDeleteExperience = (id) => {
    const { [id]: deletedItem, ...rest } = experienceData;

    setExperienceData(rest);
    updateFormData(rest);
  };

  const handleExperienceClick = () => {
    const newId = `experienceTitles${Object.keys(experienceData).length + 1}`;

    setExperienceData((prevExperienceData) => ({
      ...prevExperienceData,
      [newId]: {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        abouts: '',
        currentlyWorking: false,
      },
    }));

    updateFormData({
      ...experienceData,
      [newId]: {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        abouts: '',
        currentlyWorking: false,
      },
    });
  };

  const updateFormData = (updatedExperienceData) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      experienceData: updatedExperienceData,
    }));
  };

  return (
    <div className="basic-details">
      <h2
        className="back-title mb-5"
        onClick={onBack}
        style={{ cursor: 'pointer' }}
      >
        &larr; Experience
      </h2>
      <div>
        <Accordion defaultActiveKey="0">
          {Object.keys(experienceData).map((key, index) => (
            <Accordion.Item key={key} eventKey={key}>
              <Accordion.Header className="d-flex justify-content-between align-items-center accordion-items">
                <span className="d-flex flex-grow-1">
                  Experience {index + 1}
                </span>
                <FaTrash
                  className="delete-icon"
                  onClick={() => handleDeleteExperience(key)}
                />
              </Accordion.Header>
              <Accordion.Body>
                <Form>
                  <Form.Group>
                    <FloatingLabel label="Company" className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Enter Company"
                        name="company"
                        value={experienceData[key]?.company || ''}
                        onChange={(e) => handleChangeExperience(e, key)}
                      />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group>
                    <FloatingLabel label="Position" className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Enter position"
                        name="position"
                        value={experienceData[key]?.position || ''}
                        onChange={(e) => handleChangeExperience(e, key)}
                      />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group>
                    <FloatingLabel label="Start Date" className="mb-3">
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={experienceData[key]?.startDate || ''}
                        onChange={(e) => handleChangeExperience(e, key)}
                      />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group>
                    <FloatingLabel label="End Date" className="mb-3">
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={experienceData[key]?.endDate || ''}
                        onChange={(e) => handleChangeExperience(e, key)}
                      />
                    </FloatingLabel>
                  </Form.Group>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="abouts"
                      value={experienceData[key]?.abouts || ''}
                      onChange={(e) => handleChangeExperience(e, key)}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Check
                      type="switch"
                      label="I currently work here"
                      id={`currentlyWorking${key}`}
                      name="currentlyWorking"
                      checked={experienceData[key]?.currentlyWorking || false}
                      onChange={(e) => handleChangeExperience(e, key)}
                    />
                  </Form.Group>
                </Form>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
        <Button variant="primary" onClick={handleExperienceClick}>
          Add More
        </Button>
      </div>
    </div>
  );
};

export default ExperienceComponent;
