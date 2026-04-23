import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  product: any;
  size: string;
  quantity: number;
  color?: string;
};

type CoinRule = {
  id: string;
  conditionAr: string;
  conditionEn: string;
  coins: number;
  minOrderValue: number;
};

type Store = {
  cart: CartItem[];
  addToCart: (product: any, size: string, color?: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  toggleLanguage: () => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product, size, color) => {
        const existing = get().cart.find(
          item => item.product.id === product.id && item.size === size && item.color === color
        );
        if (existing) {
          set(state => ({
            cart: state.cart.map(item =>
              item.product.id === product.id && item.size === size && item.color === color
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }));
        } else {
          set(state => ({ cart: [...state.cart, { product, size, quantity: 1, color }] }));
        }
      },

      removeFromCart: (productId, size) => {
        set(state => ({
          cart: state.cart.filter(item => !(item.product.id === productId && item.size === size)),
        }));
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size);
          return;
        }
        set(state => ({
          cart: state.cart.map(item =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),

      wishlist: [],
      toggleWishlist: (productId) => {
        set(state => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter(id => id !== productId)
            : [...state.wishlist, productId],
        }));
      },
      isInWishlist: (productId) => get().wishlist.includes(productId),

      language: 'ar',
      setLanguage: (lang) => {
        set({ language: lang });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
          document.documentElement.setAttribute('lang', lang);
        }
      },
      toggleLanguage: () => {
        const next = get().language === 'ar' ? 'en' : 'ar';
        get().setLanguage(next);
      },

      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', next === 'dark');
        }
      },
    }),
    {
      name: 'zayy-data',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        language: state.language,
        theme: state.theme,
      }),
    }
  )
);