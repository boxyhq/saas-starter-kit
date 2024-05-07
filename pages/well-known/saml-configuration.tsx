import type { InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import React, { ReactElement, useEffect } from 'react';
import { useTranslation, Trans } from 'next-i18next';
import jackson from '@/lib/jackson';
import InputWithCopyButton from '@/components/shared/InputWithCopyButton';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';
import env from '@/lib/env';

const SPConfig: NextPageWithLayout<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ config, jacksonEnv }) => {
  const { t } = useTranslation('common');

  useEffect(() => {
    if (jacksonEnv.selfHosted) {
      window.location.href = `${jacksonEnv.externalUrl}/.well-known/saml-configuration`;
    }
  }, []);

  if (jacksonEnv.selfHosted) {
    return null;
  }

  return (
    <>
      <div className="mt-10 flex w-full justify-center px-5">
        <div className="w-full rounded border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 md:w-1/2">
          <div className="flex flex-col space-y-3">
            <h2 className="font-bold text-gray-700 md:text-xl">
              {t('sp-saml-config-title')}
            </h2>
            <p className="text-sm leading-6 text-gray-800">
              {t('sp-saml-config-description')}
            </p>
            <p className="text-sm leading-6 text-gray-600">
              <Trans
                i18nKey="refer-to-provider-instructions"
                t={t}
                components={{
                  guideLink: (
                    <a
                      href="https://boxyhq.com/docs/jackson/sso-providers"
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      {t('guides')}
                    </a>
                  ),
                }}
              />
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-6">
            <div className="form-control w-full">
              <InputWithCopyButton
                value={config.acsUrl}
                label={t('sp-acs-url')}
              />
            </div>
            <div className="form-control w-full">
              <InputWithCopyButton
                value={config.entityId}
                label={t('sp-entity-id')}
              />
            </div>
            <div className="form-control w-full">
              <div className="flex flex-col">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                  {t('response')}
                </label>
                <p className="text-sm">{config.response}</p>
              </div>
            </div>
            <div className="form-control w-full">
              <div className="flex flex-col">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                  {t('assertion-signature')}
                </label>
                <p className="text-sm">{config.assertionSignature}</p>
              </div>
            </div>
            <div className="form-control w-full">
              <div className="flex flex-col">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                  {t('signature-algorithm')}
                </label>
                <p className="text-sm">{config.signatureAlgorithm}</p>
              </div>
            </div>
            <div className="form-control w-full">
              <div className="flex flex-col">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                  {t('assertion-encryption')}
                </label>
                <p className="text-sm">
                  <Trans
                    i18nKey="sp-download-our-public-cert"
                    t={t}
                    components={{
                      downloadLink: (
                        <Link
                          href="/.well-known/saml.cer"
                          className="underline underline-offset-4"
                          target="_blank"
                        >
                          {t('download')}
                        </Link>
                      ),
                    }}
                  />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

SPConfig.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export const getServerSideProps = async ({ locale }) => {
  const { spConfig } = await jackson();

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      config: await spConfig.get(),
      jacksonEnv: {
        selfHosted: env.jackson.selfHosted,
        externalUrl: env.jackson.externalUrl || null,
      },
    },
  };
};

export default SPConfig;
