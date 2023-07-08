/* eslint @typescript-eslint/no-var-requires: "off" */
const { i18n } = require('./next-i18next.config');

// Redirect to login page if landing page is hidden
const hideLandingPage = process.env.HIDE_LANDING_PAGE === 'true' ? true : false;
const redirects = [];

if (hideLandingPage) {
  redirects.push({
    source: '/',
    destination: '/auth/login',
    permanent: true,
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['boxyhq.com'],
  },
  i18n,
  async redirects() {
    return redirects;
  },
};

module.exports = nextConfig;
