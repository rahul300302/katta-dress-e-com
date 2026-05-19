import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KATTA — Premium Men\'s T-Shirts',
  description:
    'Shop premium men\'s t-shirts at KATTA. Streetwear essentials, hot sales, and new arrivals. Nagercoil, India.',
  keywords: ['mens t-shirts', 'KATTA', 'streetwear', 'Nagercoil', 'online shopping'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans">
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
