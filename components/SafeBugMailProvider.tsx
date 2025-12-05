import { BugMailProvider, ErrorBoundary } from '@bugmail-js/react';
import React from 'react';

export function SafeBugMailProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiKey = process.env.NEXT_PUBLIC_BUGMAIL_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_BUGMAIL_PROJECT_ID;

  // 1. If no keys, just render children (app works normally)
  if (!apiKey || !projectId) {
    return <>{children}</>;
  }

  // 2. If keys exist, wrap with Provider AND ErrorBoundary
  return (
    <BugMailProvider
      apiKey={apiKey}
      projectId={projectId}
      endpoint="https://api.bugmail.site"
    >
      {/* eslint-disable-next-line i18next/no-literal-string */}
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        {children}
      </ErrorBoundary>
    </BugMailProvider>
  );
}
