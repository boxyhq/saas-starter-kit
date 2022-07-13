const env = {
  databaseUrl: `${process.env.DATABASE_URL}`,
  appUrl: `${process.env.APP_URL}`,
  product: "saas-next",
  redirectAfterSignIn: "/organizations/switch",

  // SAML Jackson configuration
  samlAudience: "https://saml.boxyhq.com",
  samlPath: "/api/auth/sso/acs",
  acsUrl: `${process.env.APP_URL}/auth/sso-callback`,

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
};

export default env;
