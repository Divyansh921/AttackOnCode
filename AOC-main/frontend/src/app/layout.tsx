import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Attack on Code — Build Better Teams for Hackathons',
  description: 'Find builders, form teams, and ship projects together. The hackathon collaboration ecosystem for student developers.',
};

import { Shell } from '@/components/layout/shell';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${cinzel.variable} antialiased`}>
        <Providers>
          <Shell>
            {children}
          </Shell>
        </Providers>
      </body>
    </html>
  );
}

