import type { OryClientConfiguration } from '@ory/elements-react';

const config: OryClientConfiguration = {
  project: {
    default_redirect_url: '/dashboard',
    error_ui_url: '/auth/error',
    name: 'SaaS Starter Kit',
    registration_enabled: true,
    verification_enabled: true,
    recovery_enabled: true,
    login_ui_url: '/auth/login',
    registration_ui_url: '/auth/join',
    recovery_ui_url: '/auth/forgot-password',
    verification_ui_url: '/auth/verify-email',
    settings_ui_url: '/auth/settings',
  },
};

export default config;
