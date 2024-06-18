import React, { useContext } from "react";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
//import ResumeContext from "../../Context/ResumeContext";

const NavBar = () => {
  //const { handlePrint } = useContext(ResumeContext);
  const templates = [{ name: "Template 1" }, { name: "Template 2" }];

  const colours = [{ name: "Red" }, { name: "Blue" }];
  
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="sticky-top">
      <Container fluid>
        <Navbar.Brand href="#">
          <img
            src="./logo.png"
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="Logo"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            <NavDropdown
              title={`TEMPLATES (${templates.length})`}
              id="basic-nav-dropdown"
            >
              {templates.map((template, index) => (
                <NavDropdown.Item key={index} href={`#template${index}`}>
                  {template.name}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
            <NavDropdown title="COLOURS" id="basic-nav-dropdown">
              {colours.map((colour, index) => (
                <NavDropdown.Item key={index} href={`#colour${index}`}>
                  {colour.name}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </Nav>
          <div className="d-flex">
            <Button
              variant="outline-light"
              // onClick={onSaveProgress}
              className="ml-2"
            >
              SAVE PROGRESS
            </Button>
            <Button
              variant="outline-light"
              className="ml-2"
            >
              LOAD PROGRESS
            </Button>
            <Button
              variant="outline-light"
              // onClick={handlePrint}
              className="ml-2"
            >
              DOWNLOAD AS PDF
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default NavBar;
