import React, { useContext } from 'react';
import NavBar from '@/components/NavBar/NavBar';
import ResumeContext from '@/components/Context/ResumeContext';
import ClassicTheme from '@/components/Themes/Classic/ClassicTheme';
import Sidebar from '@/components/Sidebar/Sidebar';

const Index = () => {
  const {
    formData,
    setFormData,
    componentRef,
    handleInputChange,
    handleAboutChange,
  } = useContext(ResumeContext);

  return (
    <>
      <div className="container-fluid custom-container">
        <div className="row custom-row">
          <div className="col-md-6 fixed-column">
            <Sidebar
              formData={formData}
              setFormData={setFormData}
              handleInputChange={handleInputChange}
              handleAboutChange={handleAboutChange}
            />
          </div>
          <div className="col-md-6 scrollable-column">
            <ClassicTheme
              componentRef={componentRef}
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
