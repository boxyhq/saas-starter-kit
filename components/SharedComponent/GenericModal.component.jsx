/* eslint-disable i18next/no-literal-string */
import React, { useContext, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { UseDataFetch } from '../../Utils/UseDataFetch';
import ResumeContext from '@/components/Context/ResumeContext';

const GenericModal = ({ show, handleClose }) => {
  const [showModal, setShowModal] = useState(false);
  const { formData, setFormData } = useContext(ResumeContext);
  const { userTokens, setUserTokens } = useState(0);
  const [jobDescription, setJobDescription] = useState(
    'This is the initial value'
  );

  const handleOpen = () => setShowModal(true);

  const initialData = {
    title: 'Paste few key points from any Job Description',
    view: '',
    data: ' Paste a detailed job description from linkedin job post',
  };

  // const { data } = UseDataFetch("localApi", `/getAboutPhrases`);
  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };
  //This function will prepare the JSON format for the open ai API POST method
  const handleDataForAI = () => {
    const experienceData = {};

    for (const key in formData.experienceData) {
      if (formData.experienceData.hasOwnProperty(key)) {
        experienceData[key] = {
          impact: formData.experienceData[key].impact,
        };
      }
    }
    return {
      jd: jobDescription,
      about: formData.about,
      experienceData,
    };
  };

  const handleFormDataModification = (responseData) => {
    const updatedFormData = { ...formData };
    updatedFormData.about = responseData.about;
    //updatedFormData.title=responseData.title;
    for (const key in responseData.experienceData) {
      if (updatedFormData.experienceData.hasOwnProperty(key)) {
        updatedFormData.experienceData[key].impact =
          responseData.experienceData[key].impact;
      }
    }
    setFormData(updatedFormData);
  };

  const generateResume = async () => {
    let resumeDataForAI = handleDataForAI();
    let prompt = `# Task: Customize the "about" section and the "impact" points in the "experienceData" section based on the job description (JD) provided, ensuring alignment with the roles and responsibilities in the JD without changing the industry.

# Instructions:
- Read the provided JD.
- Modify the "about" section to align more closely with the key themes and requirements in the JD, showcasing relevant skills and experiences without changing the industry focus.
- Update the "impact" points in the "experienceData" section to highlight achievements that reflect the innovative and technical aspects emphasized in the JD, ensuring relevance to the given experience.
- Return the modified JSON object with just the "about" and "experienceData" sections updated." Format:
 ${JSON.stringify(resumeDataForAI)}`;
    const data = UseDataFetch('openAiApi', `/v1/chat/completions`);
    //handleFormDataModification(JSON.parse(data.choices[0].message.content));
  };

  // Update form data when fetched data changes
  // useEffect(() => {
  //   if (data) {
  //     setPhrases(data);
  //   }
  // }, [data]);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{initialData.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <Form>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Control
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                    as="textarea"
                    rows={8}
                    placeholder="Paste your resume or a detailed job description to generate a customized resume"
                  />
                </Form.Group>
              </Form>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="secondary" onClick={generateResume}>
          Generate Resume
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GenericModal;
