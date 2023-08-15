import { Loading } from '@/components/shared';
import axios from 'axios';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState, type ReactElement, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';

const GithubPage: NextPageWithLayout = () => {
  const [prs, setPrs] = useState([]);

  useEffect(() => {
    getPRs();
  }, []);

  // if (isError) {
  //   return <Error message={isError.message} />;
  // }

  const getPRs = async () => {
    const response = await axios.get(`/api/github`, {});

    const { data, error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data) {
      setPrs(data);
    }
  };

  if (prs.length === 0) {
    return <Loading />;
  }

  return (
    <>
      <div key={'githubpage'} className="rounded p-6 border">
        <h1 className="text-2xl font-bold mb-4">Github PRs</h1>
        {prs.map((pr: any, index) => {
          return (
            <div className="card-compact card w-96" key={index}>
              <div className="card-body">
                <h2 className="card-title">{pr.title}</h2>
                <a href={pr.url}>{pr.url}</a>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

GithubPage.getLayout = function getLayout(page: ReactElement) {
  return <div>{page}</div>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale }: GetServerSidePropsContext = context;
  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default GithubPage;
