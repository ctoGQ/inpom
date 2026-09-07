import React from 'react';
import '@/styles/mycabinet.css';
import { ThemeProvider } from '@/components/theme-provider';

export default function MyCabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
