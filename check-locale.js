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
