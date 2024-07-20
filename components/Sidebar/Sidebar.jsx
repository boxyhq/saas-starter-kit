/* eslint-disable i18next/no-literal-string */
import React, { useState } from 'react';
import BasicDetails from './BasicDetails';
import './Sidebar.css';
import SkillComponent from './SkillComponent';
import EducationComponent from './EducationComponent';
import ExperienceComponent from './ExperienceComponent';
import Activity from './ActivityComponent';
import LanguagesComponent from './LanguagesComponent';

const Sidebar = ({
  formData,
  setFormData,
  handleInputChange,
  handleAboutChange,
}) => {
  const [activeSection, setActiveSection] = useState(null);

  const handleItemClick = (section) => {
    setActiveSection(section);
  };

  const renderDetails = () => {
    switch (activeSection) {
      case 'basicDetails':
        return (
          <BasicDetails
            formData={formData}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            handleAboutChange={handleAboutChange}
            onBack={() => setActiveSection(null)}
          />
        );
      case 'skillSet':
        return (
          <LanguagesComponent
            formData={formData}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            onBack={() => setActiveSection(null)}
          />
        );
      case 'education':
        return (
          <EducationComponent
            formData={formData}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            onBack={() => setActiveSection(null)}
          />
        );
      case 'experience':
        return (
          <ExperienceComponent
            formData={formData}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            onBack={() => setActiveSection(null)}
          />
        );
      case 'activities':
        return (
          <Activity
            formData={formData}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            onBack={() => setActiveSection(null)}
          />
        );
      default:
        return renderSidebarItems();
    }
  };

  const renderSidebarItems = () => (
    <div className="sidebar-items">
      <div
        className="sidebar-item"
        onClick={() => handleItemClick('basicDetails')}
      >
        Basic details <span className="arrow">›</span>
      </div>
      <div className="sidebar-item" onClick={() => handleItemClick('skillSet')}>
        Skills and expertise <span className="arrow">›</span>
      </div>
      <div
        className="sidebar-item"
        onClick={() => handleItemClick('education')}
      >
        Education <span className="arrow">›</span>
      </div>
      <div
        className="sidebar-item"
        onClick={() => handleItemClick('experience')}
      >
        Experience <span className="arrow">›</span>
      </div>

      <div
        className="sidebar-item"
        onClick={() => handleItemClick('activities')}
      >
        Activities <span className="arrow">›</span>
      </div>
      <button className="reset-button">RESET ALL EDITS</button>
    </div>
  );

  return <div className="col-md-6 sidebar">{renderDetails()}</div>;
};

export default Sidebar;
