import type { GetServerSidePropsContext, InferGetServerSidePropsType, NextPageContext } from 'next';
import { ResetPasswordForm } from '@/components/interfaces/Auth/resetPasswordForm';
import { getParsedCookie } from '@/lib/cookie';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { getCsrfToken, useSession } from 'next-auth/react';
import env from '@/lib/env';
import { AuthLayout } from '@/components/layouts';
import type { NextPageWithLayout } from 'types';
import { ReactElement } from 'react';
import { useRouter } from 'next/router';


const ResetPasswordPage: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken, redirectAfterSignIn }) => {
    const { status } = useSession();
    const router = useRouter();

    if (status === 'authenticated') {
        router.push(redirectAfterSignIn);
    }
    
    return (
        <div>
            <ResetPasswordForm />
        </div>
    );
};


ResetPasswordPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <AuthLayout heading="Reset Password" description="Enter new password">
            {page}
        </AuthLayout>
    );
};

export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const { req, res, locale }: GetServerSidePropsContext = context;

    const cookieParsed = getParsedCookie(req, res);

    return {
        props: {
            ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
            csrfToken: await getCsrfToken(context),
            redirectAfterSignIn: cookieParsed.url ?? env.redirectAfterSignIn,
        },
    };
};


export default ResetPasswordPage;
