import blockedDomains from './freeEmailService.json';

export const isBusinessEmail = (email: string) => {
  if (email.indexOf('@') > 0 && email.indexOf('@') < email.length - 3) {
    const emailDomain = email.split('@')[1];

    return !blockedDomains[emailDomain];
  }
};

export function extractEmailDomain(email: string) {
  return email.split('@')[1];
}
