/* eslint-disable i18next/no-literal-string */
import React, { useContext, useEffect, useState } from 'react';
import { Accordion, Button, FloatingLabel, Form } from 'react-bootstrap';
import ResumeContext from '@/compoents/Context/ResumeContext';

const AwardsComponent = ({ onBack }) => {
  const { formData, setFormData } = useContext(ResumeContext);
  const [awardCount, setAwardCount] = useState(0);
  const [awardArrTemplate, setAwardArrTemplate] = useState([]);

  const [awardData, setAwardData] = useState({
    awardTitles: [],
  });

  const handleChangeAward = (e) => {
    const { name, value, id } = e.target;
    const awardTitleIndex = id.replace(/\D+/g, ''); // extract the number from the id
    const awardTitleKey = `awardTitles${awardTitleIndex}`;

    let tempAwardData = awardData;
    if (!tempAwardData[awardTitleKey]) {
      tempAwardData[awardTitleKey] = {};
    }
    tempAwardData[awardTitleKey][name] = value;

    setAwardData({ ...awardData }, tempAwardData);
  };

  const handleDeleteAward = (index) => {
    const newAwardData = { ...awardData };
    delete newAwardData[`awardTitles${index + 1}`];
    setAwardData(newAwardData);

    const newAwardArrTemplate = awardArrTemplate.filter((_, i) => i !== index);
    setAwardArrTemplate(newAwardArrTemplate);
    setAwardCount(awardCount - 1);
  };
  const handleAwardClick = (e) => {
    e.preventDefault();
    let i = awardCount;
    ++i;
    const template = (
      <>
        <Accordion.Item key={i} eventKey={i}>
          <Accordion.Header className="d-flex justify-content-between align-items-center accordion-items">
            <span className="d-flex flex-grow-1">Award {i}</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteAward(i - 1)}
            >
              X
            </Button>
          </Accordion.Header>
          <Accordion.Body>
            <Form>
              <Form.Group>
                <FloatingLabel label="Award Name" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Award Name"
                    id={`award${i}`}
                    name="award"
                    onChange={handleChangeAward}
                  />
                </FloatingLabel>
              </Form.Group>
              <Form.Group>
                <FloatingLabel label="Award by" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter Award by"
                    id={`awardby${i}`}
                    name="awardby"
                    onChange={handleChangeAward}
                  />
                </FloatingLabel>
              </Form.Group>
              <Form.Group>
                <FloatingLabel label="Date" className="mb-3">
                  <Form.Control
                    type="date"
                    id={`date${i}`}
                    name="date"
                    onChange={handleChangeAward}
                  />
                </FloatingLabel>
              </Form.Group>
              <Form.Group>
                <FloatingLabel label="About the Award" className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="aboutaward"
                    onChange={handleChangeAward}
                  />
                </FloatingLabel>
              </Form.Group>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </>
    );
    let arr = awardArrTemplate;
    arr.push(template);
    setAwardArrTemplate(arr);
    setAwardCount(i);

    setAwardData((prevAwardData) => ({
      ...prevAwardData,
      awardTitles: [...prevAwardData.awardTitles, {}],
    }));
  };
  useEffect(() => {
    setFormData((prevFormData) => ({ ...prevFormData, awardData }));
  }, [formData, awardData, setFormData]);

  return (
    <div className="basic-details">
      <h2
        className="back-title mb-5"
        onClick={onBack}
        style={{ cursor: 'pointer' }}
      >
        &larr; Awards
      </h2>
      <div>
        <Accordion defaultActiveKey="0">
          {awardCount > 0
            ? awardArrTemplate.map((element, index) => (
                <div key={index}>{element}</div>
              ))
            : null}
        </Accordion>
        <Button variant="primary" onClick={handleAwardClick}>
          Add More
        </Button>
      </div>
    </div>
  );
};

export default AwardsComponent;
