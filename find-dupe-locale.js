const allValues = {};

const localeFile = require('./locales/en/common.json');

for (const [key, value] of Object.entries(localeFile)) {
  const arr = allValues[value] || [];
  allValues[value] = arr.concat(key);
}

const dupValues = {};

for (const [key, value] of Object.entries(allValues)) {
  if (value.length > 1) {
    dupValues[key] = value;
  }
}

if (Object.keys(dupValues).length) {
  console.error(`Duplicate values found in locale file: ${Object.keys(dupValues).length}`);
  for (const [key, value] of Object.entries(dupValues)) {
    console.error(`${value}: ${key}`);
  }
}
