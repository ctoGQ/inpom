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
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-gradient-to-b dark:from-black dark:to-[#181725]">
        {children}
      </div>
    </ThemeProvider>
  );
}
