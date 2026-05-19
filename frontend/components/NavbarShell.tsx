import { Suspense } from 'react';
import Navbar from '@/components/Navbar';

export default function NavbarShell() {
  return (
    <Suspense fallback={<header className="h-16 border-b border-store-border bg-white md:h-18" />}>
      <Navbar />
    </Suspense>
  );
}
