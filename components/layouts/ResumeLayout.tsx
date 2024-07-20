import React from 'react';
import AppShell from '../shared/shell/AppShell';
import { SWRConfig } from 'swr';
import NavBar from '@/components/NavBar/NavBar';

interface ResumeLayoutProps {
  children: React.ReactNode;
}

export default function ResumeLayout({ children }: ResumeLayoutProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
      }}
    >
      <AppShell>{children}</AppShell>
    </SWRConfig>
  );
}
