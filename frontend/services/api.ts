import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Product {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  offerPrice?: number;
  category: string;
  collection: string;
  sizes: string[];
  sizeStock?: Record<string, number>;
  colors: string[];
  colorVariants?: { name: string; image: string }[];
  productUploadImages?: string[];
  colorBasedImages?: string[];
  stock: number;
  isHotSale?: boolean;
  isOffer?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
}

export interface CartItem {
  _id: string;
  productId: string;
  name: string;
  image: string;
  images?: string[];
  size: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  stock: number;
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
}

export interface DeliveryAddress {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  /** Home / Office / Other */
  label?: string;
  flatHouse?: string;
  area?: string;
  landmark?: string;
  alternatePhone?: string;
  deliveryInstructions?: string;
  /** Usual t-shirt size for faster checkout */
  preferredSize?: string;
}

export interface Order {
  _id: string;
  items: CartItem[];
  deliveryAddress: DeliveryAddress;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  userId?: string | { _id: string; name: string; email: string };
}

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export default api;
