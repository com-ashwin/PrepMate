import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'PrepMate — AI Study & Interview Mentor',
  description:
    'Your super-strict AI mentor for deep, structured, production-grade learning. Master any topic or ace your next technical interview.',
  keywords: ['study', 'interview prep', 'AI mentor', 'learning', 'FAANG', 'technical interview'],
  openGraph: {
    title: 'PrepMate — AI Study & Interview Mentor',
    description: 'Super-strict AI mentor for structured, advanced learning',
    type: 'website',
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
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise-overlay">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
