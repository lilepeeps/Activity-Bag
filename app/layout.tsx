import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Activity Bag - Get Ideas, Stay Active',
  description:
    'An activity suggestion tool for kids. Get activity ideas, track completion, and earn rewards!',
  icons: {
    icon: '🎒',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-nunito">{children}</body>
    </html>
  );
}
