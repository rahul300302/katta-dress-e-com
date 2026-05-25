'use client';

import PageTransition from './PageTransition';

export default function AnimatedMain({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <PageTransition>{children}</PageTransition>
    </main>
  );
}
