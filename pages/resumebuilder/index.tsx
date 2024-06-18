import { useContext, useState } from "react";
import ResumeContext from "./Context/ResumeContext";
import Theme1 from "./Theme/Theme1";
import Sidebar from "./sidebar/Sidebar";
import ResumeState from "./Context/ResumeState";
import NavBar from "./NavBar";


const ResumeBuilder = () => {
  // const { formData, setFormData, componentRef, handleInputChange , handleAboutChange} =
  //   useContext(ResumeContext);
  const initialData = {
    name: "John Doe",
    imageUrl: "https://randomuser.me/api/portraits/men/18.jpg",
    title: "Frontend Developer",
    email: "johnd468@email.com",
    websiteUrl: "www.resume.vercel.app",
    phone: "+1 (999)-888-7777",
    location: "Austin",
    relevantExperience: "2 Years",
    totalExperience: "6 Years",
    linkedin: "https://www.linkedin.com/in/",
    twitter: "https://www.twitter.com/",
    github: "https://github.com/",
    hackerrank: "https://www.hackerrank.com/",
    hackerearth: "https://www.hackerearth.com/",
    codechef: "https://www.codechef.com/",
    leetcode: "https://leetcode.com/",
    about:
      "I am a web developer having expertise in frontend development and exposure to back- end development. I design and develop web applications using the latest technologies to deliver the product with quality code.",
    educationData: {
      educationTitles: {},
      educationTitles1: {
        school: "VTU, University",
        degree: "MS",
        area: "Computer Science technology",
        grade: "A",
        startDate: "16-02-2009",
        endDate: "16-02-2010",
      },
      educationTitles2: {
        school: "VTU, University",
        degree: "MS",
        area: "Computer Science technology",
        grade: "A",
        startDate: "16-02-2009",
        endDate: "16-02-2010",
      },
    },
    experienceData: {
      experienceTitles1: {
        company: "Company 1",
        position: "Senior Software Developer",
        startDate: "01-04-2021",
        endDate: "01-04-2022",
        abouts:
          "Use my extensive experience with front end development to define the structure and components for the project, making sure they are reusable",
      },
      experienceTitles2: {
        company: "Company 2",
        position: "Senior Software Developer",
        startDate: "01-04-2021",
        endDate: "01-04-2022",
        abouts:
          "Use my extensive experience with front end development to define the structure and components for the project, making sure they are reusable",
      },
    },
    awardData: {
      awardTitles1: {
        award: "Company 1",
        awardby: "Senior Software Developer",
        date: "01-04-2021",
        aboutaward:
          "Use my extensive experience with front end development to define the structure and components for the project, making sure they are reusable",
      },
      awardTitles2: {
        award: "Company 2",
        awardby: "Senior Software Developer",
        date: "01-04-2021",
        aboutaward:
          "Use my extensive experience with front end development to define the structure and components for the project, making sure they are reusable",
      },
    },
    aboutModal: "",
  };

  const [formData, setFormData] = useState(initialData);

  return (
    <>
   <NavBar />
    <div className="container-fluid custom-container">
      <div className="row custom-row">
        <div className="fixed-column">
          <Sidebar
            formData={formData}
            setFormData={setFormData}
           
          />
        </div>
        <div className="col-md-6 scrollable-column">
          
          <Theme1
            
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      </div>
    </div>
  </>
  );
};

export default ResumeBuilder;
