import type { Metadata } from 'next';
import './globals.css';
import './revision.css';

export const metadata: Metadata = {
  title: 'DOO Field Manual',
  description: 'Private Director of Operations interview-prep field manual for ABA clinic operations.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head><meta name="robots" content="noindex, nofollow" /></head>
      <body>{children}</body>
    </html>
  );
}
