const env = {
  databaseUrl: `${process.env.DATABASE_URL}`,
  appUrl: `${process.env.APP_URL}`,
  redirectIfAuthenticated: '/dashboard',
  securityHeadersEnabled: process.env.SECURITY_HEADERS_ENABLED ?? false,

  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  },

  ory: {
    sdkUrl:
      process.env.ORY_SDK_URL ||
      process.env.NEXT_PUBLIC_ORY_SDK_URL ||
      'http://localhost:4433',
    adminUrl: process.env.ORY_ADMIN_URL || 'http://localhost:4434',
    apiKey: process.env.ORY_API_KEY,
  },

  svix: {
    url: process.env.SVIX_URL,
    apiKey: process.env.SVIX_API_KEY,
  },

  github: {
    clientId: `${process.env.GITHUB_CLIENT_ID}`,
    clientSecret: `${process.env.GITHUB_CLIENT_SECRET}`,
  },

  google: {
    clientId: `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
  },

  retraced: {
    url: process.env.RETRACED_URL
      ? `${process.env.RETRACED_URL}/auditlog`
      : undefined,
    apiKey: process.env.RETRACED_API_KEY,
    projectId: process.env.RETRACED_PROJECT_ID,
  },

  groupPrefix: process.env.GROUP_PREFIX,

  jackson: {
    url: process.env.JACKSON_URL,
    externalUrl: process.env.JACKSON_EXTERNAL_URL || process.env.JACKSON_URL,
    apiKey: process.env.JACKSON_API_KEY,
    productId: process.env.JACKSON_PRODUCT_ID || 'boxyhq',
    selfHosted: process.env.JACKSON_URL !== undefined,
    openid: {
      jwsAlg: 'RS256',
      privateKey: process.env.POLIS_OPENID_PRIVATE_KEY,
      publicKey: process.env.POLIS_OPENID_PUBLIC_KEY,
    },
    sso: {
      callback: `${process.env.APP_URL}`,
      issuer: 'https://saml.boxyhq.com',
      path: '/api/oauth/saml',
      oidcPath: '/api/oauth/oidc',
      idpLoginPath: '/auth/idp-login',
    },
    dsync: {
      webhook_url: `${process.env.APP_URL}/api/webhooks/dsync`,
      webhook_secret: process.env.JACKSON_WEBHOOK_SECRET,
    },
  },

  confirmEmail: process.env.CONFIRM_EMAIL === 'true',

  mixpanel: {
    token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },

  disableNonBusinessEmailSignup:
    process.env.DISABLE_NON_BUSINESS_EMAIL_SIGNUP === 'true',

  authProviders: process.env.AUTH_PROVIDERS || 'github,credentials',

  otel: {
    prefix: process.env.OTEL_PREFIX || 'boxyhq.saas',
  },

  hideLandingPage: process.env.HIDE_LANDING_PAGE === 'true',

  darkModeEnabled: process.env.NEXT_PUBLIC_DARK_MODE !== 'false',

  teamFeatures: {
    sso: process.env.FEATURE_TEAM_SSO !== 'false',
    dsync: process.env.FEATURE_TEAM_DSYNC !== 'false',
    webhook: process.env.FEATURE_TEAM_WEBHOOK !== 'false',
    apiKey: process.env.FEATURE_TEAM_API_KEY !== 'false',
    auditLog: process.env.FEATURE_TEAM_AUDIT_LOG !== 'false',
    payments:
      process.env.FEATURE_TEAM_PAYMENTS === 'false'
        ? false
        : Boolean(
            process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
          ),
    deleteTeam: process.env.FEATURE_TEAM_DELETION !== 'false',
  },

  recaptcha: {
    siteKey: process.env.RECAPTCHA_SITE_KEY || null,
    secretKey: process.env.RECAPTCHA_SECRET_KEY || null,
  },

  maxLoginAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS) || 5,

  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};

export default env;
