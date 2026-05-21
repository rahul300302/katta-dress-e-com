'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Menu,
  User,
  Package,
  LogOut,
  Home,
  Flame,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import SideDrawer from '@/components/SideDrawer';
import ThemeToggle from '@/components/ThemeToggle';
import { useMounted } from '@/hooks/useMounted';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { getGoogleAuthUrl } from '@/lib/auth';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Shop', icon: LayoutGrid },
  { href: '/products?isHotSale=true', label: 'Hot Sales', icon: Flame },
  { href: '/products?isNewArrival=true', label: 'New Arrivals', icon: Sparkles },
  { href: '/products?isBestSeller=true', label: 'Best Sellers', icon: Package },
];

const iconBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-store-border text-store-text transition hover:border-store-text hover:bg-store-faint';

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
  let isMatch = true;
  linkParams.forEach((value, key) => {
    if (searchParams.get(key) !== value) isMatch = false;
  });
  return isMatch;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const mounted = useMounted();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const itemCount = useCartStore((s) => s.itemCount);
  const bumpKey = useCartStore((s) => s.bumpKey);
  const refreshCart = useCartStore((s) => s.refresh);
  const clearCart = useCartStore((s) => s.clear);

  const showUser = mounted && user;
  const showAdmin = mounted && isAdmin;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) refreshCart();
    else if (mounted) clearCart();
  }, [mounted, isAuthenticated, refreshCart, clearCart]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search.trim())}`);
      setDrawerOpen(false);
    }
  }

  function handleLogout() {
    logout();
    clearCart();
    setDrawerOpen(false);
    router.push('/');
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-store-border bg-store-bg-95 text-store-text backdrop-blur-md transition-shadow ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="container-main flex h-14 items-center gap-2 sm:h-16 sm:gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`${iconBtn} lg:hidden`}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <BrandLogo size="md" priority className="shrink-0" />

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap text-sm font-medium transition-colors hover:text-store-text ${
                  navLinkActive(pathname, searchParams, l.href)
                    ? 'text-store-text underline decoration-2 underline-offset-8'
                    : 'text-store-muted'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={handleSearch}
            className="ml-auto flex max-w-[120px] items-center sm:max-w-[160px] md:max-w-[200px]"
          >
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-store-muted" />
              <input
                type="search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-store-border bg-store-faint py-2 pl-8 pr-3 text-xs text-store-text placeholder:text-store-muted outline-none transition focus:border-store-text focus:ring-1 focus:ring-store-text/20 sm:text-sm"
              />
            </div>
          </form>

          <ThemeToggle className="!h-9 !w-9" />

          <Link
            id="cart-nav-icon"
            href="/cart"
            className={`${iconBtn} relative`}
            title="Shopping Cart"
            aria-label={`Cart${itemCount ? `, ${itemCount} items` : ''}`}
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence mode="popLayout">
              {itemCount > 0 && (
                <motion.span
                  key={`${itemCount}-${bumpKey}`}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.35 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-store-text px-1 text-[10px] font-bold text-store-bg"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {showAdmin && (
            <Link
              href="/admin"
              className="hidden rounded-full border border-store-border px-3 py-1.5 text-xs font-semibold text-store-text transition hover:bg-store-faint lg:inline-flex"
            >
              Admin
            </Link>
          )}

          {showUser ? (
            <div className="hidden items-center gap-1 lg:flex">
              <Link
                href="/account/orders"
                className={iconBtn}
                title="My Orders"
                aria-label="Orders"
              >
                <Package className="h-5 w-5" />
              </Link>
              {user.avatar && !avatarError ? (
                <img
                  src={user.avatar}
                  alt=""
                  title={user.name || "User Profile"}
                  onError={() => setAvatarError(true)}
                  className="h-9 w-9 rounded-full border border-store-border object-cover"
                />
              ) : (
                <span className={iconBtn} title={user.name || "User Profile"}>
                  <User className="h-5 w-5" />
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className={iconBtn}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden text-sm font-semibold text-store-text hover:underline lg:block"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Menu" side="left">
        <nav className="flex flex-col gap-1 p-4">
          {links.map((l) => {
            const Icon = l.icon;
            const active = navLinkActive(pathname, searchParams, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-store-text text-store-bg'
                    : 'text-store-text hover:bg-store-faint'
                }`}
              >
                <Icon className="h-5 w-5" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={handleSearch} className="border-t border-store-border px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-store-muted" />
            <input
              type="search"
              placeholder="Search tees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-elegant !pl-9"
            />
          </div>
        </form>

        <div className="flex items-center justify-between border-t border-store-border px-4 py-3">
          <span className="text-xs font-semibold uppercase text-store-muted">Theme</span>
          <ThemeToggle />
        </div>

        <div className="mt-auto border-t border-store-border p-4">
          {showUser ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-xl bg-store-faint px-4 py-3">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-10 w-10 rounded-full" />
                ) : (
                  <div className={`${iconBtn} !h-10 !w-10`}>
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-store-text">{user.name}</p>
                  <p className="truncate text-xs text-store-muted">{user.email}</p>
                </div>
              </div>
              <Link
                href="/account/orders"
                onClick={() => setDrawerOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-store-text hover:bg-store-faint"
              >
                <Package className="h-4 w-4" />
                My Orders
              </Link>
              {showAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setDrawerOpen(false)}
                  className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-store-text hover:bg-store-faint"
                >
                  Admin Panel
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-store-faint"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <a href={getGoogleAuthUrl()} className="btn-primary w-full text-center text-sm">
              Sign in with Google
            </a>
          )}
        </div>
      </SideDrawer>
    </>
  );
}
