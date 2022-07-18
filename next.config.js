/* eslint @typescript-eslint/no-var-requires: "off" */
const withTM = require("next-transpile-modules")(["react-daisyui"]);

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,
  images: {
    domains: ["tailwindui.com", "boxyhq.com"],
  },
});

module.exports = nextConfig;
