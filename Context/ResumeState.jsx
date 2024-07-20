import ResumeContext from './ResumeContext';
import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { UseDataFetch } from '../Utils/UseDataFetch';
import context from 'react-bootstrap/esm/AccordionContext';

const ResumeState = (props) => {
  const componentRef = useRef();

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state

  const { data, error } = UseDataFetch('localApi', '/resumeInitialData');

  useEffect(() => {
    if (data) {
      setFormData(data);
      setLoading(false); // Set loading to false once data is fetched
    } else if (error) {
      setLoading(false); // Set loading to false if there's an error
    }
  }, [data, error]);

  // const [formData, setFormData] = useState(initialData);
  // const { data }  = UseDataFetch('localAPI','/resumeInitialData');

  //   // Update form data when fetched data changes
  //   useEffect(() => {
  //     if (data) {
  //       setFormData(data);
  //     }
  //   }, [data]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onBeforePrint: () => {
      setLoading(true);
    },
    onAfterPrint: () => {
      setLoading(false);
    },
  });
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAboutChange = (data) => {
    let myVal = data;
    setFormData((prevData) => ({
      ...prevData,
      about: myVal,
    }));
  };

  const templates = [{ name: 'Template 1' }, { name: 'Template 2' }];

  const colours = [{ name: 'Red' }, { name: 'Blue' }];

  const handleSaveProgress = () => {
    console.log('Save progress');
  };
  const handleLoadProgress = () => {
    console.log('Load progress');
  };

  const handleDownloadPdf = () => {
    console.log('Download as PDF');
  };

  //   const [themeData, setThemeData] = useState(initialData);
  //   const [checkProj, setCheckProj] = useState(false);
  //   const [checkWork, setCheckWork] = useState(false);
  //   const [checkAward, setCheckAward] = useState(false);

  //   //Change bellow two state for create any new Theme
  //   const [showComponent, setShowComponent] = useState(false);
  //   const [currentTheme, setCurrentTheme] = useState("Theme1");
  //   const [selectBtn, setSelectBtn] = useState(true);

  return (
    <ResumeContext.Provider
      value={{
        handleInputChange,
        formData,
        handleAboutChange,
        setFormData,
        componentRef,
        handlePrint: handlePrint,
      }}
    >
      {props.children}
    </ResumeContext.Provider>
  );
};

export default ResumeState;
