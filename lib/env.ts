const env = {
  databaseUrl: `${process.env.DATABASE_URL}`,
  appUrl: `${process.env.APP_URL}`,
  product: "saas-next",
  redirectAfterSignIn: "/teams/switch",

  // SAML Jackson configuration
  saml: {
    issuer: "https://saml.boxyhq.com",
    path: "/api/auth/sso/acs",
    callback: `${process.env.APP_URL}/auth/sso`,
    acs: `${process.env.APP_URL}/api/auth/sso/acs`,
  },

  // SMTP configuration for NextAuth
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  },

  // NextAuth configuration
  nextAuth: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  // Svix
  svix: {
    url: `${process.env.SVIX_URL}`,
    apiKey: `${process.env.SVIX_API_KEY}`,
  },
};

export default env;
