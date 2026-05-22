'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Package, ShoppingCart, Users, IndianRupee, Plus, Eye, Pencil } from 'lucide-react';
import HeroSlideEditor from '@/components/admin/HeroSlideEditor';
import AnnouncementEditor from '@/components/admin/AnnouncementEditor';
import api, { type Product, type Order, type AppUser } from '@/services/api';
import { formatPrice } from '@/lib/constants';
import BrandLogo from '@/components/BrandLogo';
import ImageUploader from '@/components/admin/ImageUploader';
import ColorVariantEditor from '@/components/admin/ColorVariantEditor';
import { variantsToProductFields } from '@/lib/colorVariants';
import type { ColorVariant } from '@/lib/colorVariants';
import SizeStockEditor from '@/components/admin/SizeStockEditor';
import AdminProductModal, { type ProductFormData } from '@/components/admin/AdminProductModal';
import type { SizeStockMap } from '@/lib/productStock';
import { useAuthStore } from '@/store/authStore';
import { getGoogleAuthUrl, getOAuthCallbackUrl } from '@/lib/auth';
import BrandingEditor from '@/components/admin/BrandingEditor';
import { useMounted } from '@/hooks/useMounted';

type Tab = 'products' | 'hero' | 'orders' | 'users';

export default function AdminPage() {
  const router = useRouter();
  const mounted = useMounted();
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [tab, setTab] = useState<Tab>('products');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    collection: 'Essentials',
    sizeStock: { M: 10, L: 10, XL: 10 } as SizeStockMap,
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colorVariants: [{ name: 'Black', image: '' }] as ColorVariant[],
    images: [] as string[],
    isHotSale: false,
    isOffer: false,
    isNewArrival: false,
    isBestSeller: false,
  });

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/admin`);
      return;
    }
    if (!isAdmin) return;

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [dashRes, productsRes, ordersRes, usersRes] = await Promise.all([
          api.get('/admin/dashboard').catch(() => null),
          api.get('/products?limit=50').catch(() => null),
          api.get('/orders/admin/all').catch(() => null),
          api.get('/admin/users').catch(() => null),
        ]);

        if (dashRes?.data?.data) {
          setStats(dashRes.data.data.stats);
        }
        if (productsRes?.data?.data?.products) {
          setProducts(productsRes.data.data.products);
        } else {
          console.warn('Products API returned unexpected format:', productsRes?.data);
        }
        if (ordersRes?.data?.data) {
          setOrders(Array.isArray(ordersRes.data.data) ? ordersRes.data.data : []);
        }
        if (usersRes?.data?.data) {
          setUsers(usersRes.data.data);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load admin data';
        setError(message);
        console.error('Admin data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAuthenticated, isAdmin, mounted]);

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const synced = variantsToProductFields(form.colorVariants);
      if (!synced.colorVariants.length) {
        alert('Add at least one color with an image uploaded');
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
        colorVariants: synced.colorVariants,
        colors: synced.colors,
        images: synced.images.length ? synced.images : form.images,
        isHotSale: form.isHotSale,
        isOffer: form.isOffer,
        isNewArrival: form.isNewArrival,
        isBestSeller: form.isBestSeller,
        sizes: form.sizes,
      });
      
      // Fetch updated product list
      const res = await api.get('/products?limit=50');
      if (res.data?.data?.products) {
        setProducts(res.data.data.products);
      }
      
      // Reset form
      setForm({
        ...form,
        name: '',
        description: '',
        price: '',
        offerPrice: '',
        sizeStock: { M: 10, L: 10, XL: 10 },
        colorVariants: [{ name: 'Black', image: '' }],
        images: [],
      });
      alert('Product created successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      console.error('Create product error:', err);
      alert(message);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((p) => p.filter((x) => x._id !== id));
      if (modalProduct?._id === id) setModalProduct(null);
      alert('Product deleted successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      console.error('Delete product error:', err);
      alert(message);
    }
  }

  function openProductModal(product: Product, mode: 'view' | 'edit') {
    setModalProduct(product);
    setModalMode(mode);
  }

  async function handleUpdateProduct(id: string, form: ProductFormData) {
    try {
      const synced = variantsToProductFields(form.colorVariants);
      const res = await api.patch(`/products/${id}`, {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        offerPrice: form.offerPrice ? Number(form.offerPrice) : undefined,
        sizeStock: form.sizeStock,
        collection: form.collection,
        colorVariants: synced.colorVariants,
        colors: synced.colors,
        images: synced.images.length ? synced.images : form.images,
        isHotSale: form.isHotSale,
        isOffer: form.isOffer,
        isNewArrival: form.isNewArrival,
        isBestSeller: form.isBestSeller,
      });
      const updated = res.data.data as Product;
      setProducts((list) => list.map((p) => (p._id === id ? updated : p)));
      setModalProduct(updated);
      alert('Product updated successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      console.error('Update product error:', err);
      alert(message);
    }
  }

  function openProductModal(product: Product, mode: 'view' | 'edit') {
    setModalProduct(product);
    setModalMode(mode);
  }

  async function updateOrderStatus(id: string, orderStatus: string) {
    try {
      await api.patch(`/orders/${id}/status`, { orderStatus });
      setOrders((o) => o.map((x) => (x._id === id ? { ...x, orderStatus } : x)));
      alert('Order status updated!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      console.error('Update order error:', err);
      alert(message);
    }
  }

  async function toggleUserRole(user: AppUser) {
    try {
      const nextRole = user.role === 'admin' ? 'user' : 'admin';
      if (!confirm(`Set ${user.email} as ${nextRole}?`)) return;
      const res = await api.patch(`/admin/users/${user._id}/role`, { role: nextRole });
      setUsers((list) => list.map((u) => (u._id === user._id ? res.data.data : u)));
      alert('User role updated!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user role';
      console.error('Toggle user role error:', err);
      alert(message);
    }
  }

  if (!mounted) {
    return (
      <div className="container-main py-20 text-center text-store-muted animate-pulse">
        Loading admin...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!isAdmin) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-store-muted">Sign in with an admin Google account</p>
        <a
          href={getGoogleAuthUrl(getOAuthCallbackUrl('/admin'))}
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
    { id: 'hero', label: 'Site Settings' },
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

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          <p className="font-semibold">Error loading admin data</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="mt-6 text-center text-store-muted text-sm">
          Loading admin data...
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="surface-card p-6"
          >
            <Icon className="mb-2 h-5 w-5 text-store-muted" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-store-muted">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex overflow-x-auto flex-nowrap -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 border-b border-store-border scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-semibold ${
              tab === t.id ? 'border-b-2 border-store-text' : 'text-store-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hero' && (
        <div className="space-y-8">
          <BrandingEditor />
          <AnnouncementEditor />
          <HeroSlideEditor />
        </div>
      )}

      {tab === 'products' && (
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <form onSubmit={handleCreateProduct} className="space-y-4 rounded-2xl border border-store-border p-4 sm:p-6">
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
            <ColorVariantEditor
              variants={form.colorVariants}
              onChange={(colorVariants) => {
                const synced = variantsToProductFields(colorVariants);
                setForm({
                  ...form,
                  colorVariants,
                  images: synced.images.length ? synced.images : form.images,
                });
              }}
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
            <h2 className="font-semibold text-store-muted">All Products ({products.length})</h2>
            {loading ? (
              <div className="text-center py-8 text-store-muted text-sm">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-store-muted text-sm rounded-xl border border-store-border/50 p-4">
                <p>No products found</p>
                <p className="text-xs mt-1">Create a product using the form on the left</p>
              </div>
            ) : (
              products.map((p) => (
              <div key={p._id} className="flex flex-col gap-3 rounded-xl border border-store-border p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-store-faint">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-store-muted">
                        No img
                      </div>
                    )}
                    {p.images.length > 1 && (
                      <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[9px] text-white">
                        +{p.images.length - 1}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-sm sm:text-base">{p.name}</p>
                    <p className="text-xs text-store-muted sm:text-sm mt-0.5">
                      {formatPrice(p.offerPrice || p.price)} ·{' '}
                      {Object.entries(p.sizeStock || {})
                        .map(([s, n]) => `${s}:${n}`)
                        .join(' · ') || `Stock ${p.stock}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end items-center pt-2.5 border-t border-store-border/50 sm:pt-0 sm:border-0">
                  <button
                    type="button"
                    onClick={() => openProductModal(p, 'view')}
                    className="btn-secondary !px-2.5 !py-1.5 text-xs flex items-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => openProductModal(p, 'edit')}
                    className="btn-secondary !px-2.5 !py-1.5 text-xs flex items-center gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(p._id)}
                    className="text-xs text-red-600 hover:underline px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
              ))
            )}
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
                        u.role === 'admin' ? 'bg-store-text text-store-bg' : 'bg-store-faint text-store-muted'
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
      <AdminProductModal
        product={modalProduct}
        mode={modalMode}
        open={!!modalProduct}
        onClose={() => setModalProduct(null)}
        onSave={handleUpdateProduct}
      />
    </div>
  );
}
