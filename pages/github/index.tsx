import { Loading } from '@/components/shared';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState, type ReactElement, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';
import { Button, Select } from 'react-daisyui';

const ownerRepos = [
  'boxyhq/jackson',
  'retracedhq/retraced',
  'boxyhq/terminus',
  'boxyhq/saml20',
  'boxyhq/saas-starter-kit',
  'retracedhq/retraced-js',
  'retracedhq/logs-viewer',
  'retracedhq/retraced-go',
  'boxyhq/mock-saml',
];

const excludes = { 'boxyhq/jackson': ['pg'] };

const GithubPage: NextPageWithLayout = () => {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    getPRs(selectedIndex);
  }, []);

  // if (isError) {
  //   return <Error message={isError.message} />;
  // }

  const getPRs = async (index) => {
    const response = await fetch(
      `/api/github/${ownerRepos[index]}?excludes=${JSON.stringify(excludes)}`
    );
    const json = await response.json();

    const { data, error } = json;

    // console.log('response:', data);

    if (error) {
      toast.error(error.message);
      return;
    }

    setLoading(false);
    setPrs(data || []);
  };

  if (loading) {
    return <Loading />;
  }

  const onApproveAll = () => {
    return async () => {
      for (const pr of prs) {
        try {
          const response = await fetch(
            `/api/github/${ownerRepos[selectedIndex]}/review?pull_number=${
              (pr as any).number
            }`
          );
          const json = await response.json();

          // console.log('response:', json);
        } catch (err) {
          console.error('err:', err);
        }
      }
      getPRs(selectedIndex);
    };
  };

  const onApprove = (pull_number) => {
    return async () => {
      try {
        const response = await fetch(
          `/api/github/${ownerRepos[selectedIndex]}/review?pull_number=${pull_number}`
        );

        const json = await response.json();

        // console.log('response:', json);
      } catch (err) {
        console.error('err:', err);
      }
      getPRs(selectedIndex);
    };
  };

  return (
    <>
      <div key={'githubpage'} className="rounded p-6 border">
        <h1 className="text-2xl font-bold mb-4">Github PRs</h1>
        <Select
          value={selectedIndex}
          onChange={(event) => {
            setSelectedIndex(Number(event.target.value));
            getPRs(Number(event.target.value));
          }}
        >
          {ownerRepos.map((ownerRepo, i) => (
            <option key={ownerRepo} value={i}>
              {ownerRepo}
            </option>
          ))}
        </Select>
        {prs.length ? (
          <div style={{ padding: '10px' }}>
            <Button color="primary" onClick={onApproveAll()}>
              Approve All & Merge
            </Button>
          </div>
        ) : null}
        {prs.map((pr: any, index) => {
          return (
            <div className="card-compact card w-96" key={index}>
              <div className="card-body">
                <h2 className="card-title">{pr.title}</h2>
                <a href={pr.url}>{pr.url}</a>
                <Button color="primary" onClick={onApprove(pr.number)}>
                  Approve & Merge
                </Button>
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
