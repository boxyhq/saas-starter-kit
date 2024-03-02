const domainRegex =
  /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/;

export const isValidDomain = (domain: string): boolean => {
  return domainRegex.test(domain);
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const defaultHeaders = {
  'Content-Type': 'application/json',
};

export const passwordPolicies = {
  minLength: 8,
};

export const maxLengthPolicies = {
  name: 104,
  nameShortDisplay: 20,
  email: 254,
  password: 128,
  team: 50,
  slug: 50,
  domain: 253,
  domains: 1024,
  apiKeyName: 64,
  webhookDescription: 100,
  webhookEndpoint: 2083,
};
