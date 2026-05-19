'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Menu, X, User, Package } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useMounted } from '@/hooks/useMounted';
import { useAuthStore } from '@/store/authStore';

const links = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/products?isHotSale=true', label: 'Hot Sales' },
  { href: '/products?isNewArrival=true', label: 'New Arrivals' },
];

function navLinkActive(pathname: string, searchParams: URLSearchParams, href: string) {
  const [path, query] = href.split('?');
  if (pathname !== path) return false;
  if (!query) {
    return (
      !searchParams.get('isHotSale') &&
      !searchParams.get('isNewArrival') &&
      !searchParams.get('isOffer') &&
      !searchParams.get('isBestSeller') &&
      !searchParams.get('q')
    );
  }
  const linkParams = new URLSearchParams(query);
  for (const [key, value] of linkParams.entries()) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const mounted = useMounted();
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const showUser = mounted && user;
  const showAdmin = mounted && isAdmin;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/products?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-store-border bg-white/95 shadow-sm backdrop-blur-md' : 'bg-white'
      }`}
    >
      <div className="container-main flex h-16 items-center justify-between gap-4 md:h-18">
        <BrandLogo size="md" priority />

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-store-text ${
                navLinkActive(pathname, searchParams, l.href) ? 'text-store-text' : 'text-store-muted'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden max-w-xs flex-1 md:flex">
          <motion.div
            whileFocus={{ scale: 1.01 }}
            className="relative w-full"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-store-muted" />
            <input
              type="search"
              placeholder="Search tees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-elegant !py-2.5 !pl-10"
            />
          </motion.div>
        </form>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-store-border transition-colors hover:border-store-text"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
        </motion.div>

        {showAdmin && (
          <Link href="/admin" className="hidden text-sm font-medium text-store-muted hover:text-store-text lg:block">
            Admin
          </Link>
        )}

        {showUser ? (
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/account/orders"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-store-text ${
                pathname === '/account/orders' ? 'text-store-text' : 'text-store-muted'
              }`}
            >
              <Package className="h-4 w-4" />
              Orders
            </Link>
            <div className="flex items-center gap-2 border-l border-store-border pl-3">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="h-8 w-8 rounded-full" />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="max-w-[100px] truncate text-sm">{user.name.split(' ')[0]}</span>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-store-border lg:hidden"
          >
            <nav className="container-main flex flex-col gap-4 py-4">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-sm font-medium">
                  {l.label}
                </Link>
              ))}
              <form onSubmit={handleSearch}>
                <input
                  type="search"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-elegant"
                />
              </form>
              {showUser && (
                <Link href="/account/orders" onClick={() => setMobileOpen(false)} className="text-sm font-medium">
                  My Orders
                </Link>
              )}
              {showAdmin && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-sm font-medium">
                  Admin
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
