import env from './env';
import { ApiError } from './errors';

export const validateRecaptcha = async (token: string) => {
  if (!env.recaptcha.siteKey || !env.recaptcha.secretKey) {
    return true;
  }

  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${env.recaptcha.secretKey}&response=${token}`,
    {
      method: 'POST',
    }
  );

  const { success } = await response.json();

  if (!success) {
    throw new ApiError(400, 'Invalid captcha. Please try again.');
  }

  return true;
};
