import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DOO Field Manual',
  description: 'Interactive Director of Operations interview-prep field manual for ABA clinic operations.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
