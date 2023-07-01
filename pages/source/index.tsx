import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import UploadCSV from './csvupload'; // Adjust the path based on the actual location of the UploadCSV component

const Source = () => {
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = async (file: File) => {
    setUploadStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload feedback');
      }

      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex gap-7">
      <UploadCSV onFileUpload={handleFileUpload} />
      {uploadStatus === 'uploading' && <p>Uploading feedback...</p>}
      {uploadStatus === 'success' && <p>Feedback uploaded successfully!</p>}
      {uploadStatus === 'error' && <p>Error: {errorMessage}</p>}
    </div>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default Source;









