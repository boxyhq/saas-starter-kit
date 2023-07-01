import { useState } from 'react';

interface UploadCSVProps {
  onFileUpload: (file: File) => void;
}

const UploadCSV: React.FC<UploadCSVProps> = ({ onFileUpload }) => {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileUpload(file);
    }
  };

  return (
    <div style={styles.uploadContainer}>
      <h2>Upload Your Feedback Data</h2>
      <p style={styles.infoText}>
        Please upload a CSV file containing feedback data. The file should include a header row, with
        each subsequent row containing an individual piece of feedback.
      </p>
      <input
        type="file"
        id="csvUpload"
        accept=".csv"
        onChange={handleFileChange}
        style={styles.inputFile}
      />
      <label htmlFor="csvUpload" style={styles.uploadLabel}>
        {fileName || 'Choose a CSV file'}
      </label>
    </div>
  );
};

const styles = {
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    border: '2px dashed #ccc',
    borderRadius: '5px',
    maxWidth: '300px',
    margin: 'auto'
  },
  inputFile: {
    display: 'none'
  },
  uploadLabel: {
    backgroundColor: '#007BFF',  // default button color changed to blue
    color: 'white',
    padding: '10px 20px',
    margin: '10px 0',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  infoText: {
    margin: '10px 0',
    lineHeight: '1.6',
    color: '#333'
  }
};

export default UploadCSV;



