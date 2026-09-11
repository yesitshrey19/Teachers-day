import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Faculty Superlatives Poll',
  description: 'Vote for your favorite Civil Engineering faculty superlatives!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 min-h-screen text-slate-800`}
      >
        {children}
      </body>
    </html>
  );
}
