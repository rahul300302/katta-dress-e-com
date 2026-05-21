import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/AnnouncementBar';
import NavbarShell from '@/components/NavbarShell';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import ThemeProvider from '@/components/ThemeProvider';
import CartFlyAnimation from '@/components/CartFlyAnimation';

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
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('katta-theme');var t=s?JSON.parse(s):null;var th=(t&&t.state&&t.state.theme)||'light';document.documentElement.classList.add(th);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
        <Providers>
          <AnnouncementBar />
          <NavbarShell />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CartFlyAnimation />
        </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
