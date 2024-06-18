import React, { useState, useEffect } from "react";
import { Tab, Tabs, Form, FloatingLabel } from "react-bootstrap";
import { EditorState, ContentState, convertFromHTML } from "draft-js";
import { convertToHTML } from "draft-convert";
// import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
// import RichEditor from "../RichEditor.component";

const BasicDetails = ({
  formData,
  setFormData,
  handleInputChange,
  handleAboutChange,
  onBack,
}) => {
  const [key, setKey] = useState("contacts");
  // const [editorState, setEditorState] = useState(() =>
  //    EditorState.createEmpty()
  // );

  useEffect(() => {
    if (formData.aboutModal) {
      const blocksFromHTML = convertFromHTML(formData.aboutModal);
      const contentState = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, [formData.about]);

  const handleEditorChange = (state) => {
    setEditorState(state);
    const html = convertToHTML(editorState.getCurrentContent());
    handleAboutChange(html);
    setFormData({ ...formData, about: html });
  };

  return (
    <div className="basic-details">
      <h2
        className="back-title mb-5"
        style={{ cursor: "pointer" }}
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
                  value={formData.name}
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
                  value={formData.title}
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
            <Form>
              <Form.Group controlId="formAbout">
                <Form.Label className="p-2 mt-3 form-label">About</Form.Label>
                <div className="m-2">
                  {/* <RichEditor
                    editorState={editorState}
                    setEditorState={setEditorState}
                    onChange={handleEditorChange}
                    showCustomButtons={true}
                  /> */}
                </div>
              </Form.Group>
              <div className="mt-5">
                <Form.Group controlId="formObjective">
                  <Form.Label className="p-2 mt-3 form-label">
                    Objective
                  </Form.Label>
                  <div className="m-2">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.objective}
                      name="objective"
                      onChange={handleInputChange}
                    />
                  </div>
                </Form.Group>
              </div>
            </Form>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default BasicDetails;
