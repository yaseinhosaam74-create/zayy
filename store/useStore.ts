import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/getProducts';

// ── Types ──────────────────────────────────────────────

export type CartItem = {
  product: Product;
  size: string;
  quantity: number;
};

type Store = {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Language
  language: 'en' | 'ar';
  toggleLanguage: () => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

// ── Store ──────────────────────────────────────────────

export const useStore = create<Store>()(
  persist(
    (set, get) => ({

      // ── Cart ────────────────────────────────────────

      cart: [],

      addToCart: (product, size) => {
        const existing = get().cart.find(
          (item) =>
            item.product.id === product.id && item.size === size
        );
        if (existing) {
          set({
            cart: get().cart.map((item) =>
              item.product.id === product.id && item.size === size
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ cart: [...get().cart, { product, size, quantity: 1 }] });
        }
      },

      removeFromCart: (productId, size) => {
        set({
          cart: get().cart.filter(
            (item) =>
              !(item.product.id === productId && item.size === size)
          ),
        });
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(productId, size);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      // ── Wishlist ─────────────────────────────────────

      wishlist: [],

      toggleWishlist: (productId) => {
        const exists = get().wishlist.includes(productId);
        set({
          wishlist: exists
            ? get().wishlist.filter((id) => id !== productId)
            : [...get().wishlist, productId],
        });
      },

      isInWishlist: (productId) => {
        return get().wishlist.includes(productId);
      },

      // ── Language ─────────────────────────────────────

      language: 'ar',

      toggleLanguage: () => {
        const next = get().language === 'ar' ? 'en' : 'ar';
        document.documentElement.setAttribute(
          'dir',
          next === 'ar' ? 'rtl' : 'ltr'
        );
        document.documentElement.setAttribute('lang', next);
        set({ language: next });
      },

      // ── Theme ────────────────────────────────────────

      theme: 'light',

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },

    }),
    {
      name: 'my-store-data',
    }
  )
);