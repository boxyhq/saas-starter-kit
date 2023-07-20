// TODO: Add disposable email domain to the list
const emailDomains = [
  '@gmail.com',
  '@yahoo.com',
  '@hotmail.com',
  '@outlook.com',
  '@protonmail.com',
  '@aol.com',
  '@icloud.com',
  '@zoho.com',
  '@mail.com',
  '@gmzil.com',
];

export const isNonWorkEmailDomain = (email: string) => {
  const domain = email.substring(email.lastIndexOf('@'));

  return emailDomains.includes(domain);
};
