const fs = require('fs');
const path = require('path');
const regExp = /\bt\('(.*?)'/gm;
const altRegExp = /\bi18nKey='(.*?)'/gm;

const allStrings = {};

const localeFile = require('./locales/en/common.json');

const files = fs.readdirSync('./', { recursive: true, withFileTypes: true });
//console.log('files:', files);

files.forEach((file) => {
  if (file.isDirectory()) {
    return;
  }
  if (file.path.includes('node_modules')) {
    return;
  }

  if (['.ts', '.tsx'].includes(path.extname(file.name).toLowerCase())) {
    const fileContent = fs.readFileSync(path.join(file.path, file.name), 'utf8');

    (fileContent.match(regExp) || []).forEach((match) => {
      const id = match.replace("t('", '').replace("'", '');
      // console.log('match:', match);
      allStrings[id] = true;
      if (!localeFile[id]) {
        console.error(`Missing key: ${path.join(file.path, file.name)} - ${id}`);
      }
    });

    (fileContent.match(altRegExp) || []).forEach((match) => {
      const id = match.replace("i18nKey='", '').replace("'", '');
      // console.log('match:', match, id);
      allStrings[id] = true;
      if (!localeFile[id]) {
        console.error(`Missing key: ${path.join(file.path, file.name)} - ${id}`);
      }
    });
  }
});

Object.keys(localeFile).forEach((key) => {
  if (!allStrings[key]) {
    console.error(`Unused key: ${key}`);
  }
});
