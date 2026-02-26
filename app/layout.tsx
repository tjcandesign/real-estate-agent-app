import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Pro - Real Estate Assistant',
  description: 'Complete real estate agent management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: ClerkProvider will be added in a client wrapper component
  // This temporary version removes it to test if it's causing 404s
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
