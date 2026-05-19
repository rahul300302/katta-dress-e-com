'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Users, IndianRupee, Plus } from 'lucide-react';
import api, { type Product, type Order, type AppUser } from '@/services/api';
import { formatPrice } from '@/lib/constants';
import BrandLogo from '@/components/BrandLogo';
import ImageUploader from '@/components/admin/ImageUploader';
import SizeStockEditor from '@/components/admin/SizeStockEditor';
import type { SizeStockMap } from '@/lib/productStock';
import { useAuthStore } from '@/store/authStore';
import { getGoogleAuthUrl } from '@/lib/auth';

type Tab = 'products' | 'orders' | 'users';

export default function AdminPage() {
  const router = useRouter();
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [tab, setTab] = useState<Tab>('products');
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    collection: 'Essentials',
    sizeStock: { M: 10, L: 10, XL: 10 } as SizeStockMap,
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['Black'],
    images: [] as string[],
    isHotSale: false,
    isOffer: false,
    isNewArrival: false,
    isBestSeller: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/admin`);
      return;
    }
    if (!isAdmin) return;

    api.get('/admin/dashboard').then((res) => {
      setStats(res.data.data.stats);
      setOrders(res.data.data.recentOrders || []);
    });
    api.get('/products?limit=50').then((res) => setProducts(res.data.data.products));
    api.get('/orders/admin/all').then((res) => setOrders(res.data.data));
    api.get('/admin/users').then((res) => setUsers(res.data.data));
  }, [isAuthenticated, isAdmin, router]);

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!form.images.length) {
      alert('Add at least one product image');
      return;
    }
    if (!Object.keys(form.sizeStock).length) {
      alert('Add stock for at least one size');
      return;
    }
    await api.post('/products', {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      offerPrice: form.offerPrice ? Number(form.offerPrice) : undefined,
      sizeStock: form.sizeStock,
      collection: form.collection,
      colors: form.colors,
      images: form.images,
      isHotSale: form.isHotSale,
      isOffer: form.isOffer,
      isNewArrival: form.isNewArrival,
      isBestSeller: form.isBestSeller,
      sizes: form.sizes,
    });
    const res = await api.get('/products?limit=50');
    setProducts(res.data.data.products);
    setForm({
      ...form,
      name: '',
      description: '',
      price: '',
      offerPrice: '',
      sizeStock: { M: 10, L: 10, XL: 10 },
      images: [],
    });
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    setProducts((p) => p.filter((x) => x._id !== id));
  }

  async function updateOrderStatus(id: string, orderStatus: string) {
    await api.patch(`/orders/${id}/status`, { orderStatus });
    setOrders((o) => o.map((x) => (x._id === id ? { ...x, orderStatus } : x)));
  }

  async function toggleUserRole(user: AppUser) {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Set ${user.email} as ${nextRole}?`)) return;
    const res = await api.patch(`/admin/users/${user._id}/role`, { role: nextRole });
    setUsers((list) => list.map((u) => (u._id === user._id ? res.data.data : u)));
  }

  if (!isAuthenticated) return null;

  if (!isAdmin) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-store-muted">Sign in with an admin Google account</p>
        <a
          href={getGoogleAuthUrl(typeof window !== 'undefined' ? `${window.location.origin}/admin` : '/admin')}
          className="btn-primary mt-6 inline-flex"
        >
          Sign in with Google
        </a>
      </div>
    );
  }

  const statCards = [
    { label: 'Products', value: stats.products, icon: Package },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart },
    { label: 'Users', value: stats.users, icon: Users },
    { label: 'Revenue', value: formatPrice(stats.revenue), icon: IndianRupee },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="container-main py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BrandLogo size="md" showName={false} href="/" />
          <h1 className="section-title">Admin</h1>
        </div>
        <Link href="/products" className="btn-secondary text-sm">
          View Store
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-store-border bg-white p-6"
          >
            <Icon className="mb-2 h-5 w-5 text-store-muted" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-store-muted">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex gap-2 border-b border-store-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold ${
              tab === t.id ? 'border-b-2 border-store-text' : 'text-store-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <form onSubmit={handleCreateProduct} className="space-y-4 rounded-2xl border border-store-border p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Plus className="h-4 w-4" /> Add Product
            </h2>
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-elegant"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-elegant min-h-[80px]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                type="number"
                placeholder="Price ₹"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-elegant"
              />
              <input
                type="number"
                placeholder="Offer ₹"
                value={form.offerPrice}
                onChange={(e) => setForm({ ...form, offerPrice: e.target.value })}
                className="input-elegant"
              />
            </div>
            <SizeStockEditor
              value={form.sizeStock}
              onChange={(sizeStock) => setForm({ ...form, sizeStock })}
            />
            <ImageUploader images={form.images} onChange={(images) => setForm({ ...form, images })} />
            <input
              placeholder="Collection"
              value={form.collection}
              onChange={(e) => setForm({ ...form, collection: e.target.value })}
              className="input-elegant"
            />
            <div className="flex flex-wrap gap-3 text-sm">
              {(['isHotSale', 'isOffer', 'isNewArrival', 'isBestSeller'] as const).map((key) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  />
                  {key.replace('is', '')}
                </label>
              ))}
            </div>
            <button type="submit" className="btn-primary w-full">
              Create Product
            </button>
          </form>

          <div className="space-y-3">
            {products.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-xl border border-store-border p-4">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-store-muted">
                    {formatPrice(p.offerPrice || p.price)} ·{' '}
                    {Object.entries(p.sizeStock || {})
                      .map(([s, n]) => `${s}:${n}`)
                      .join(' · ') || `Stock ${p.stock}`}
                  </p>
                </div>
                <button type="button" onClick={() => deleteProduct(p._id)} className="text-sm text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="mt-8 space-y-4">
          {orders.map((o) => {
            const customer = (o as Order & { userId?: { name?: string; email?: string } }).userId;
            return (
              <div key={o._id} className="rounded-xl border border-store-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">Order #{o._id.slice(-8)}</p>
                    {customer && typeof customer === 'object' && (
                      <p className="text-sm text-store-muted">
                        {customer.name} · {customer.email}
                      </p>
                    )}
                    <p className="text-sm text-store-muted">
                      {formatPrice(o.totalAmount)} · {o.paymentStatus}
                    </p>
                  </div>
                  <select
                    value={o.orderStatus}
                    onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                    className="input-elegant !w-auto !py-2"
                  >
                    {['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'users' && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-store-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-store-border bg-store-faint">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-store-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-store-faint text-xs font-bold">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      {u.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-store-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                        u.role === 'admin' ? 'bg-store-text text-white' : 'bg-gray-100'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-store-muted">
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleUserRole(u)}
                      className="text-xs font-medium text-store-text hover:underline"
                    >
                      {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="py-12 text-center text-store-muted">No users yet</p>
          )}
        </div>
      )}
    </div>
  );
}
