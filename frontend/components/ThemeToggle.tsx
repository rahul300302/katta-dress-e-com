'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useMounted } from '@/hooks/useMounted';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const mounted = useMounted();
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  if (!mounted) {
    return (
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-store-border ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-store-border text-store-text transition hover:border-store-text hover:bg-store-faint ${className}`}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
