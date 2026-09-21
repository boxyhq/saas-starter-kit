const fs = require('fs');
const path = require('path');
const regExp = /\bt\('(.*?)'/gm;
const altRegExp = /\bi18nKey="(.*?)"/gm;
// const authLayoutRegExp =
//   /\bAuthLayout.*\bheading="(.*?)".*\bdescription="(.*?)"/gm;
const authHeadingRegExp = /\bheading="(.*?)"/gm;
const authDescriptionRegExp = /\bdescription="(.*?)"/gm;
const exceptionList = [
  'email-verified',
  'allow-only-work-email',
  'verify-account-expired',
  'confirm-your-email',
  'exceeded-login-attempts',
  'account-unlocked',
  'invalid-credentials',
  'no-credentials',
  'token-not-found',
  // API error messages (used dynamically via t(json?.error?.message))
  'Something went wrong',
  'The e-mail address you entered is invalid',
  "We can't find a user with that e-mail address",
  'User not found',
  'Your account is already active. Please try logging in.',
  'Invitation expired. Please request a new one.',
  'We currently only accept work email addresses for sign-up. Please use your work email to create an account. If you don\'t have a work email, feel free to contact our support team for assistance.',
  'An user with this email already exists.',
  'A team name is required.',
  'A team with this slug already exists.',
  'Email change is not allowed.',
  'Please use your work email.',
  'Email already in use.',
  'Email is required.',
  'It seems you entered a non-business email. Invitations can only be sent to work emails.',
  'This user is already a member of the team.',
  'An invitation already exists for this email.',
  'Could not create invitation. Please try again.',
  "You don't have permission to delete this invitation.",
  'You must be logged in with the email address you were invited with.',
  'You must be logged in with an email address from an allowed domain.',
  'Password reset token is required',
  'Invalid password reset token. Please request a new one.',
  'Password reset token has expired. Please request a new one.',
  'Error updating password. Please try again.',
  'Your current password is incorrect',
  'A team should have at least one owner.',
  'This slug is already taken for a team.',
  'This domain is already associated with a team.',
  'Not Found',
  'Bad request.',
  'Bad request. Please add a Svix API key.',
  'A team with the slug already exists.',
  'Unauthorized',
  'File size too big (max 2MB)',
  'File type not supported (.png or .jpg only)',
  'stripe-checkout-fallback-error',
];

const allStrings = {};

const localeFile = require('./locales/en/common.json');

const files = fs.readdirSync('./', { recursive: true, withFileTypes: true });

let error = false;

files.forEach((file) => {
  if (file.isDirectory()) {
    return;
  }
  if (file.path.includes('node_modules')) {
    return;
  }

  if (['.ts', '.tsx'].includes(path.extname(file.name).toLowerCase())) {
    const fileContent = fs.readFileSync(
      path.join(file.path, file.name),
      'utf8'
    );

    (fileContent.match(regExp) || []).forEach((match) => {
      const id = match.replace("t('", '').replace("'", '');
      allStrings[id] = true;
      if (!localeFile[id]) {
        error = true;
        console.error(
          `Missing key: ${path.join(file.path, file.name)} - ${id}`
        );
      }
    });

    (fileContent.match(altRegExp) || []).forEach((match) => {
      const id = match.replace('i18nKey="', '').replace('"', '');
      allStrings[id] = true;
      if (!localeFile[id]) {
        error = true;
        console.error(
          `Missing key: ${path.join(file.path, file.name)} - ${id}`
        );
      }
    });

    [authHeadingRegExp, authDescriptionRegExp].forEach((regExp) => {
      const authGroups = fileContent.match(regExp) || [];
      authGroups.forEach((match) => {
        const parts = match.replace('AuthLayout ', '');
        parts.split(' ').forEach((part) => {
          const id = part.startsWith('heading=')
            ? part.replace('heading="', '').replace('"', '')
            : part.replace('description="', '').replace('"', '');

          allStrings[id] = true;
          if (!localeFile[id]) {
            error = true;
            console.error(
              `Missing key: ${path.join(file.path, file.name)} - ${id}`
            );
          }
        });
      });
    });
  }
});

Object.keys(localeFile).forEach((key) => {
  if (!allStrings[key] && !exceptionList.includes(key)) {
    error = true;
    console.error(`Unused key: ${key}`);
  }
});

if (error) {
  process.exit(1);
}
