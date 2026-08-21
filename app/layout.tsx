import React from "react"
import type { Metadata } from 'next'
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono, Inter, Public_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { cn } from "@/lib/utils";
import { PublicShell } from "@/components/public-shell";

const publicSansHeading = Public_Sans({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const instrumentSans = Instrument_Sans({ 
  subsets: ["latin"],
  variable: '--font-instrument'
});

const instrumentSerif = Instrument_Serif({ 
  subsets: ["latin"],
  weight: "400",
  variable: '--font-instrument-serif'
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains'
});

export const metadata: Metadata = {
  title: 'INPOM — спільнота можливостей для жінок',
  description: 'INPOM поєднує жінок із менторами, партнерами та можливостями для розвитку, бізнесу й міжнародної співпраці.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk" suppressHydrationWarning className={cn("font-sans", inter.variable, publicSansHeading.variable)}>
      <body className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} mx-auto max-w-[1280px] border-x border-black/15 font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <PublicShell>{children}</PublicShell>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
