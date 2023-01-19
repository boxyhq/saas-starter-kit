/* eslint @typescript-eslint/no-var-requires: "off" */
const withTM = require('next-transpile-modules')(['react-daisyui']);
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,
  images: {
    domains: [],
  },
  i18n,
});

module.exports = nextConfig;
