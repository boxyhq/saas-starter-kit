import React, { useState } from "react";
import { Col, Container, Image, Row } from "react-bootstrap";
import DOMPurify from "dompurify";

import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaHackerrank,
  FaCode,
  FaGlobe,
} from "react-icons/fa";

const Theme1 = (props) => {
  const { formData, componentRef } = props;
  const [convertedContent, setConvertedContent] = useState(null);
  function createMarkup(html) {
    let finalVal = html;
    return {
      __html: DOMPurify.sanitize(html),
    };
  }
  if (!formData) {
    return null; // or some fallback UI
  }
  function formatDateString(dateString) {
    const [day, month, year] = dateString.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[month - 1]} ${year}`;
  }
  return (
    <Container className="resume-section">
      <Row>
        <div id="theme1">
          <div
            className="bg-white mx-auto my-0"
            style={{ border: "1px solid white" }}
          >
            <div className="p-2">
              <Container fluid id="section-to-print" ref={componentRef}>
                {/* Persoanl Information  */}
                <div className="container">
                  <h3
                    className="name font-medium d-flex justify-content-center mb-0"
                    title="Name"
                  >
                    {formData.name}
                  </h3>
                  <small className="text-base d-flex justify-content-center small">
                    {formData.title}
                  </small>

                  <div className="d-flex gap-3 justify-content-center">
                    <div>
                      <p className="text-sm font-normal mb-0">
                        {formData.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-normal mb-0">
                        {formData.email}
                      </p>
                    </div>
                    <div xs={2} md={1} className="text-center">
                      <a
                        href={formData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaLinkedin className="icons" />
                      </a>
                    </div>
                    <div xs={2} md={1} className="text-center">
                      <a
                        href={formData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaGlobe className="icons" /> myportfolio
                      </a>
                    </div>
                  </div>
                </div>

                {/* Summary & Objectve  */}
                <Row className="justify-content-between p-2 smb">
                  <Col className="summarys">
                    <div className="mb-3">
                      <div className="mb-2 summary">Summary</div>
                      <div className="text-sm py-1.5">
                        <div
                          className="text-summary paddings"
                          dangerouslySetInnerHTML={createMarkup(formData.about)}
                        ></div>
                      </div>
                    </div>
                  </Col>
                </Row>
                {/* Summary & Objectve  */}

                {/* Experience & Technologies  */}
                <Row className="justify-content-between p-2">
                  <Col className="summarys col-md-12">
                    <div className="mb-3">
                      <div className="mb-2 summary">Experience</div>
                      {Object.keys(formData.experienceData).map(
                        (key, index) => {
                          if (key.includes("experienceTitles")) {
                            const experienceTitle =
                              formData.experienceData[key];
                            let startDate = experienceTitle.startDate
                              ? formatDateString(experienceTitle.startDate)
                              : "";
                            let endDate = experienceTitle.endDate
                              ? formatDateString(experienceTitle.endDate)
                              : "";
                            return (
                              <div className="text-sm py-1" key={index}>
                                <div className="py-2">
                                  <p className="company-name">
                                    {experienceTitle.company}
                                  </p>
                                  <div className="d-flex justify-content-between align-item-left">
                                    <p className="job-role">
                                      {experienceTitle.position}
                                    </p>
                                    <div>
                                      <p className="text-date">
                                        {startDate} - {endDate}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-date mt-0.5">
                                    <div className="list">
                                      <ul>
                                        <li> {experienceTitle.abouts}</li>
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

                <Row className="justify-content-between p-2">
                  <Col className="summarys">
                    <div className="mb-3">
                      <div className="mb-2 summary">Awards</div>
                      {Object.keys(formData.awardData).map((key, index) => {
                        if (key.includes("awardTitles")) {
                          const awardTitle = formData.awardData[key];
                          let startDate = awardTitle.date
                            ? formatDateString(awardTitle.date)
                            : "";
                          return (
                            <div className="text-sm py-1" key={index}>
                              <div className="py-2">
                                <p className="company-name">
                                  {awardTitle.award}
                                </p>
                                <div className="d-flex justify-content-between align-item-left">
                                  <p className="job-role">
                                    {awardTitle.awardby}
                                  </p>
                                  <div>
                                    <p className="text-date">{startDate}</p>
                                  </div>
                                </div>
                                <div className="text-date mt-0.5">
                                  <div className="list">
                                    <ul>
                                      <li> {awardTitle.aboutaward}</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
        </div>
      </Row>
    </Container>
  );
};

export default Theme1;
