import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { InputWithLabel } from '@/components/ui';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const ResetPasswordForm = () => {
    const [submitting, setSubmitting] = useState<boolean>(false);
    const router = useRouter();
    const { t } = useTranslation('common');
    const { token } = router.query;

    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object().shape({
            password: Yup.string().required().min(8),
            confirmPassword: Yup.string().oneOf(
                [Yup.ref('password'), null],
                'Passwords must match'
            ),
        }),
        onSubmit: async (values) => {
            setSubmitting(true);

            const { password } = values;

            try {
                var response = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token, password }),
                });
                if (response.ok) {
                    formik.resetForm();
                    router.push('/auth/login');
                    toast.success(t('password-reset-link-sent'), {
                        position: 'top-center',
                    });

                } else {
                    toast.error(t('login-error'), {
                        position: 'top-center',
                    });
                }
            } catch (error) {
                console.error(error);
            }

            setSubmitting(false);
        },
    });

    return (
        <div className="rounded-md bg-white p-6 shadow-sm">
            <form onSubmit={formik.handleSubmit}>
                <div className="space-y-2">
                    <InputWithLabel
                        type="password"
                        label="New Password"
                        name="password"
                        placeholder="New Password"
                        value={formik.values.password}
                        error={
                            formik.touched.password ? formik.errors.password : undefined
                        }
                        onChange={formik.handleChange}
                    />
                    <InputWithLabel
                        type="password"
                        label="Confirm Password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formik.values.confirmPassword}
                        error={
                            formik.touched.confirmPassword
                                ? formik.errors.confirmPassword
                                : undefined
                        }
                        onChange={formik.handleChange}
                    />
                </div>
                <div className="mt-4">
                    <Button
                        type="submit"
                        color="primary"
                        loading={submitting}
                        active={formik.dirty}
                        fullWidth
                    >
                        Reset Password
                    </Button>
                </div>
            </form>
        </div>
    );
}

