import React, { useContext, useEffect, useState } from "react";
import { Accordion, Button, FloatingLabel, Form } from "react-bootstrap";
import ResumeContext from "../Context/ResumeContext";



const ExperienceComponent = ({ onBack }) => {
  const { formData, setFormData } = useContext(ResumeContext);
  const [experienceCount, setExperienceCount] = useState(0);
  const [experienceArrTemplate, setExperienceArrTemplate] = useState([]);
  const [experienceData, setExperienceData] = useState({
    experienceTitles: [],
  });

  
  /* Handle all experience changes */
  const handleChangeExperience = (e) => {
    const { name, value, id } = e.target;
    const experienceTitleIndex = id.replace(/\D+/g, ""); // extract the number from the id
    const experienceTitleKey = `experienceTitles${experienceTitleIndex}`;

    let tempExperienceData = experienceData;
    if (!tempExperienceData[experienceTitleKey]) {
      tempExperienceData[experienceTitleKey] = {};
    }
    tempExperienceData[experienceTitleKey][name] = value;

    setExperienceData({ ...experienceData }, tempExperienceData);
  };

  const handleDeleteExperience = (index) => {
    const newExperienceData = { ...experienceData };
    delete newExperienceData[`experienceTitles${index + 1}`];
    setExperienceData(newExperienceData);

    const newExperienceArrTemplate = experienceArrTemplate.filter(
      (_, i) => i !== index
    );
    setExperienceArrTemplate(newExperienceArrTemplate);
    setExperienceCount(experienceCount - 1);
  };



  const handleExperienceClick = (e) => {
    e.preventDefault();
    let i = experienceCount;
    ++i;
    const template = (
      <>       
        <Accordion.Item key={i} eventKey={i}>
          <Accordion.Header className="d-flex justify-content-between align-items-center accordion-items">
            <span className="d-flex flex-grow-1">Experience {i}</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteExperience(i - 1)}
            >
              X
            </Button>
          </Accordion.Header>
          <Accordion.Body>
            <Form>
              <Form.Group>
                <FloatingLabel label="Company" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter Company"
                    id={`company${i}`}
                    name="company"
                    onChange={handleChangeExperience}
                  />
                </FloatingLabel>
              </Form.Group>
              <Form.Group>
                <FloatingLabel label="Position" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter position"
                    id={`position${i}`}
                    name="position"
                    onChange={handleChangeExperience}
                  />
                </FloatingLabel>
              </Form.Group>
              <Form.Group>
                <FloatingLabel label="Start Date" className="mb-3">
                  <Form.Control
                    type="date"
                    id={`startDate${i}`}
                    name="startDate"
                    onChange={handleChangeExperience}
                  />
                </FloatingLabel>
              </Form.Group>
              <Form.Group>
                <FloatingLabel label="End Date" className="mb-3">
                  <Form.Control
                    type="date"
                    id={`endDate${i}`}
                    name="endDate"
                    onChange={handleChangeExperience}
                  />
                </FloatingLabel>
              </Form.Group>
              <Form.Group>
        
              <Form.Control
                  as="textarea"
                  rows={3}
                  name="abouts"
                  onChange={handleChangeExperience}
                />
               
               
              </Form.Group>
              <Form.Group>
                <Form.Check
                  type="switch"
                  label="I currently work here"
                  id={`currentlyWorking${i}`}
                  name="currentlyWorking"
                  checked
                  onChange={handleChangeExperience}
                />
              </Form.Group>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </>
    );
    let arr = experienceArrTemplate;
    arr.push(template);
    setExperienceArrTemplate(arr);
    setExperienceCount(i);

    setExperienceData((prevExperienceData) => ({
      ...prevExperienceData,
      experienceTitles: [...prevExperienceData.experienceTitles, {}],
    }));
  };
  useEffect(() => {
    setFormData((prevFormData) => ({ ...prevFormData, experienceData }));
  }, [experienceData]);

  return (
    <div className="basic-details">
      <h2
        className="back-title mb-5"
        onClick={onBack}
        style={{ cursor: "pointer" }}
      >
        &larr; Experience
      </h2>
      <div>
        <Accordion defaultActiveKey="0">
          {experienceCount > 0
            ? experienceArrTemplate.map((element, index) => (
                <div key={index}>{element}</div>
              ))
            : null}
        </Accordion>
        <Button variant="primary" onClick={handleExperienceClick}>
          Add More
        </Button>
      </div>
    </div>
  );
};

export default ExperienceComponent;
