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

// List of events used to create webhook endpoint
export const eventTypes = [
  'member.created',
  'member.removed',
  'invitation.created',
  'invitation.removed',
];

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
  memberId: 64,
  eventType: 50,
  eventTypes: eventTypes.length,
  endpointId: 64,
  inviteToken: 64,
  expiredToken: 64,
  invitationId: 64,
  sendViaEmail: 10,
};
