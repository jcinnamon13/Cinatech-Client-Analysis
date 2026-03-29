import type { Metadata } from 'next';
import { Playfair_Display, JetBrains_Mono, Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'CinaTech: AI-Powered Strategic Analysis for Marketing Agencies',
  description:
    'CinaTech analyses your client\'s onboarding form and produces a full strategic report: competitive gaps, compliance risks, and a ranked action plan in minutes.',
  keywords: ['client analysis', 'onboarding', 'AI', 'business consulting', 'agency', 'CinaTech'],
  metadataBase: new URL('https://cinatech.ai'),
  openGraph: {
    title: 'CinaTech: AI-Powered Strategic Analysis for Marketing Agencies',
    description: 'CinaTech analyses your client\'s onboarding form and produces a full strategic report in minutes.',
    url: 'https://cinatech.ai',
    siteName: 'CinaTech',
    type: 'website',
  },
  verification: {
    google: 'M0jgmF58Kk8meJUxl1Get5kWL4HQxVk3f-TnIW4K1a4',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${manrope.variable} ${playfair.variable} ${jetbrains.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
