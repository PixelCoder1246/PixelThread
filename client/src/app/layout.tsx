import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'PixelThread - AI-powered Blogging Platform',
    template: '%s | PixelThread',
  },
  description:
    'AI-powered blogging platform for creators and developers. Write, publish, and grow your audience with intelligent writing assistance.',
  keywords: [
    'blogging',
    'AI writing',
    'content creation',
    'publishing',
    'developer blog',
  ],
  authors: [{ name: 'PixelThread' }],
  creator: 'PixelThread',
  publisher: 'PixelThread',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pixelthread.com',
    siteName: 'PixelThread',
    title: 'PixelThread - AI-powered Blogging Platform',
    description: 'AI-powered blogging platform for creators and developers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PixelThread',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixelThread - AI-powered Blogging Platform',
    description: 'AI-powered blogging platform for creators and developers.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/PTfavicon.png',
    shortcut: '/PTfavicon.png',
    apple: '/PTfavicon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="dark"
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
