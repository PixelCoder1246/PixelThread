import type { Metadata } from 'next';
import { Providers } from '@/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PixelThread — Where Ideas Come to Life',
    template: '%s | PixelThread',
  },
  description:
    'AI-powered blogging platform for thinkers, creators, and storytellers.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  icons: {
    icon: '/PTfavicon.png',
    shortcut: '/PTfavicon.png',
    apple: '/PTfavicon.png',
  },
  openGraph: {
    title: 'PixelThread — Where Ideas Come to Life',
    description:
      'AI-powered blogging platform for thinkers, creators, and storytellers.',
    siteName: 'PixelThread',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixelThread — Where Ideas Come to Life',
    description:
      'AI-powered blogging platform for thinkers, creators, and storytellers.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
