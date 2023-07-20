import { blacklistedDomains } from './blacklist';

export const isEmailDomainBlacklisted = (email: string) => {
  const domain = email.substring(email.lastIndexOf('@'));

  return blacklistedDomains.includes(domain);
};
