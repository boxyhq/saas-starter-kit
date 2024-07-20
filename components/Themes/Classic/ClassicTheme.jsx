import React from 'react';
import './Classic.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import DOMPurify from 'dompurify';
import { FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';

const ClassicTheme = (props) => {
  const { formData, componentRef } = props;

  /* To convert HTML to regular text */
  function createMarkup(html) {
    return {
      __html: DOMPurify.sanitize(html),
    };
  }

  if (!formData) {
    return <div>Loading...</div>; // or some fallback UI
  }

  function formatDateString(dateString) {
    const [day, month, year] = dateString.split('-');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${monthNames[month - 1]} ${year}`;
  }

  // Convert the technologies array to a comma-separated string
  function joinLanguages() {
    return formData.languages?.technology
      ? formData.languages.technology.map((language, index) => (
          <li key={index}>
            <strong>{language.name}</strong>
          </li>
        ))
      : null;
  }

  return (
    <Container className="resume-section">
      <Row>
        <div id="classic">
          <div
            className="bg-white mx-auto my-0"
            style={{ border: '1px solid white' }}
          >
            <div className="p-2">
              <Container fluid id="section-to-print" ref={componentRef}>
                {/* Personal Information */}
                <div className="container">
                  <h3
                    className="name font-medium d-flex justify-content-center mb-0"
                    title="Name"
                  >
                    {formData.name || ''}
                  </h3>
                  <small className="text-base d-flex justify-content-center small">
                    {formData.title || ''}
                  </small>

                  <div className="d-flex gap-3 justify-content-center">
                    <div>
                      <p className="text-sm font-normal mb-0">
                        {formData.phone || ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-normal mb-0">
                        {formData.email || ''}
                      </p>
                    </div>
                    <div className="text-center">
                      <a
                        href={formData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaLinkedin className="icons" />
                      </a>
                    </div>
                    <div className="text-center">
                      <a
                        href={formData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGithub className="icons" />
                      </a>
                    </div>
                    <div className="text-center">
                      <a
                        href={formData.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGlobe className="icons" /> myportfolio
                      </a>
                    </div>
                  </div>
                </div>

                {/* Summary Starts here */}
                <Row className="justify-content-between smb">
                  <Col className="summarys">
                    <div>
                      <div className="summary">
                        {formData.about?.title || 'Summary'}
                      </div>
                      <div className="py-1.5">
                        <div
                          className="classic-summary"
                          dangerouslySetInnerHTML={createMarkup(
                            formData.about?.content || ''
                          )}
                        ></div>
                      </div>
                    </div>
                  </Col>
                </Row>
                {/* Summary & Objective Ends */}

                {/* Experience */}
                <Row className="justify-content-between">
                  <Col className="summarys col-md-12">
                    <div>
                      <div className="summary">Experience</div>
                      {formData.experienceData &&
                        Object.keys(formData.experienceData).map(
                          (key, index) => {
                            if (key.includes('experienceTitles')) {
                              const experienceTitle =
                                formData.experienceData[key];
                              let startDate = experienceTitle.startDate
                                ? formatDateString(experienceTitle.startDate)
                                : '';
                              let endDate = experienceTitle.endDate
                                ? formatDateString(experienceTitle.endDate)
                                : '';
                              return (
                                <div className="text-sm" key={index}>
                                  <div>
                                    <div className="classic-header">
                                      {experienceTitle.company}
                                    </div>
                                    <div className="d-flex justify-content-between align-item-left">
                                      <p className="classic-mild-header mb-1">
                                        {experienceTitle.position}
                                      </p>
                                      <div>
                                        <p className="text-date mb-0">
                                          {startDate} - {endDate}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-date mt-0.5">
                                      <div className="list">
                                        <ul className="mb-2">
                                          {experienceTitle?.impact?.map(
                                            (impact, index) => (
                                              <li key={index}>{impact}</li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }
                        )}
                    </div>
                  </Col>
                </Row>
                {/* Technologies */}
                <Row className="justify-content-between">
                  <Col className="summarys col-md-12">
                    <div>
                      <div className="summary">
                        {formData.languages?.title || 'Skills'}
                      </div>
                      <div className="text-sm py-1">
                        <Container fluid>
                          <Row className="d-flex align-items-center flex-wrap gap-2.5 py-2">
                            <Col>
                              <div className="py-1 px-2 classic-mild-header">
                                <ul className="list-unstyled">
                                  {joinLanguages() || 'No languages listed'}
                                </ul>
                              </div>
                            </Col>
                          </Row>
                        </Container>
                      </div>
                    </div>
                  </Col>
                </Row>
                {/* Education Starts */}
                <div>
                  <div className="summary">Education</div>
                  <div className="classic-summary py-1">
                    <Container fluid>
                      <Row className="d-flex align-items-center flex-wrap gap-2 py-2">
                        <Container className="p-0">
                          {formData.educationData &&
                            Object.keys(formData.educationData).map(
                              (key, index) => {
                                if (key.includes('educationTitles')) {
                                  const educationTitle =
                                    formData.educationData[key];
                                  let startDate = educationTitle.startDate
                                    ? formatDateString(educationTitle.startDate)
                                    : '';
                                  let endDate = educationTitle.endDate
                                    ? formatDateString(educationTitle.endDate)
                                    : '';
                                  return (
                                    <div key={index} className="mb-1">
                                      <div className="classic-header">
                                        {educationTitle.degree || ''}
                                        {educationTitle.degree &&
                                        educationTitle.area ? (
                                          <span> - {educationTitle.area}</span>
                                        ) : (
                                          educationTitle.area || ''
                                        )}
                                      </div>
                                      <div className="d-flex justify-content-between align-items-center">
                                        <div className="classic-mild-header">
                                          {educationTitle.school}
                                        </div>
                                        <div className="d-flex gap-3 mb-1">
                                          <div className="classic-summary">
                                            {startDate}-{endDate}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }
                            )}
                        </Container>
                      </Row>
                    </Container>
                  </div>
                </div>
                {/* Education Ends */}

                {/* Activities section starts here */}
                <Row className="justify-content-between smb">
                  <Col className="summarys">
                    <div>
                      <div className="summary">
                        {formData.activities?.title || 'Activities'}
                      </div>
                      <div className="text-sm py-1.5">
                        <div
                          className="classic-summary paddings"
                          dangerouslySetInnerHTML={createMarkup(
                            formData.activities?.content || ''
                          )}
                        ></div>
                      </div>
                    </div>
                  </Col>
                </Row>
                {/* Activities section ends here */}
              </Container>
            </div>
          </div>
        </div>
      </Row>
    </Container>
  );
};

export default ClassicTheme;
