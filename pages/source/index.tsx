import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import UploadCSV from './csvupload'; // Adjust the path based on the actual location of the UploadCSV component

const Source = () => {
  const handleFileUpload = (feedbackArray: string[]) => {
    console.log('Uploaded Feedback:', feedbackArray);
    // Process the uploaded feedback array
  };

  return (
    <div className="flex gap-7">
      <UploadCSV onFileUpload={handleFileUpload} />
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





