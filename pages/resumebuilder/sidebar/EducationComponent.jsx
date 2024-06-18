import React, { useContext, useEffect, useState } from "react";
import { Accordion, Button, FloatingLabel, Form } from "react-bootstrap";
import ResumeContext from "../Context/ResumeContext";

const EducationComponent = ({ onBack }) => {
  const { formData, setFormData } = useContext(ResumeContext);
  const [educationCount, setEducationCount] = useState(0);
  const [educationArrTemplate, setEducationArrTemplate] = useState([]);

  const [educationData, setEducationData] = useState({
    educationTitles: [],
  });

  const handleChangeEducation = (e) => {
    const { name, value, id } = e.target;
    const educationTitleIndex = id.replace(/\D+/g, ""); // extract the number from the id
    const educationTitleKey = `educationTitles${educationTitleIndex}`;

    let tempEducationData = educationData;
    if (!tempEducationData[educationTitleKey]) {
      tempEducationData[educationTitleKey] = {};
    }
    tempEducationData[educationTitleKey][name] = value;

    setEducationData({ ...educationData }, tempEducationData);
  };

  const handleDeleteEducation = (index) => {
    const newEducationData = { ...educationData };
    delete newEducationData[`educationTitles${index + 1}`];
    setEducationData(newEducationData);

    const newEducationArrTemplate = educationArrTemplate.filter(
      (_, i) => i !== index
    );
    setEducationArrTemplate(newEducationArrTemplate);
    setEducationCount(educationCount - 1);
  };
  const handleEducationClick = (e) => {
    e.preventDefault();
    let i = educationCount;
    ++i;
    const template = (
      <>
        <Accordion.Item key={i} eventKey={i}>
          <Accordion.Header className="d-flex justify-content-between align-items-center accordion-items">
            <span className="d-flex flex-grow-1">Education {i}</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteEducation(i - 1)}
            >
              X
            </Button>
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
                  checked
                  onChange={handleChangeEducation}
                />
              </Form.Group>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </>
    );
    let arr = educationArrTemplate;
    arr.push(template);
    setEducationArrTemplate(arr);
    setEducationCount(i);

    setEducationData((prevEducationData) => ({
      ...prevEducationData,
      educationTitles: [...prevEducationData.educationTitles, {}],
    }));
  };
  useEffect(() => {
    setFormData((prevFormData) => ({ ...prevFormData, educationData }));
  }, [educationData, formData, setFormData]);

  return (
    <div className="basic-details">
      <h2
        className="back-title mb-5"
        onClick={onBack}
        style={{ cursor: "pointer" }}
      >
        &larr; Education
      </h2>
      <div>
        <Accordion defaultActiveKey="0">
          {educationCount > 0
            ? educationArrTemplate.map((element, index) => (
                <div key={index}>{element}</div>
              ))
            : null}
        </Accordion>
        <Button variant="primary" onClick={handleEducationClick}>
          Add More Education
        </Button>
      </div>
    </div>
  );
};

export default EducationComponent;
