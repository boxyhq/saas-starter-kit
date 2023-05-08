import { AuthLayout } from '@/components/layouts';
import { InputWithLabel } from '@/components/ui';
import { getParsedCookie } from '@/lib/cookie';
import env from '@/lib/env';
import { useFormik } from 'formik';
import type {
    GetServerSidePropsContext,
    InferGetServerSidePropsType,
} from 'next';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';
import * as Yup from 'yup';

const ForgotPassword: NextPageWithLayout<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken, redirectAfterSignIn }) => {
    const { status } = useSession();
    const router = useRouter();
    const { t } = useTranslation('common');

    if (status === 'authenticated') {
        router.push(redirectAfterSignIn);
    }

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: Yup.object().shape({
            email: Yup.string().required().email(),
        }),
        onSubmit: async (values) => {
            const { email } = values;
    
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                }),
            });
    
            if (response.ok) {
                formik.resetForm();
                toast.success(t('password-reset-link-sent'), {
                    position: 'top-center',
                });
            } else {
                toast.error(t('login-error'), {
                    position: 'top-center',
                });
            }
        },
    });    

    return (
        <>
            <div className="rounded-md bg-white p-6 shadow-sm">
                <form onSubmit={formik.handleSubmit}>
                    <div className="space-y-2">
                        <InputWithLabel
                            type="email"
                            label="Email"
                            name="email"
                            placeholder="Email"
                            value={formik.values.email}
                            error={formik.touched.email ? formik.errors.email : undefined}
                            onChange={formik.handleChange}
                        />
                    </div>
                    <div className="mt-4">
                        <Button
                            type="submit"
                            color="primary"
                            loading={formik.isSubmitting}
                            active={formik.dirty}
                            fullWidth
                        >
                            {t('Email Password Reset Link')}
                        </Button>
                    </div>
                </form>
            </div>
            <p className="text-center text-sm text-gray-600">
                {t('Already have an account? ')}
                <Link href="/auth/login">
                    <a className="font-medium text-indigo-600 hover:text-indigo-500">
                        &nbsp;{t('Sign In')}
                    </a>
                </Link>
            </p>
        </>
    );
};

ForgotPassword.getLayout = function getLayout(page: ReactElement) {
    return (
        <AuthLayout
            heading="Verify your email"
            description="Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one."
        >
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

export default ForgotPassword;
