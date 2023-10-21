import React from 'react';
import AppShell from '../shared/shell/AppShell';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
