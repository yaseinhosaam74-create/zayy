import {
  collection, doc, getDoc, getDocs,
  query, where, orderBy, Timestamp,
  addDoc, updateDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

export type ProductColor = {
  name: string;
  nameAr: string;
  hex: string;
  images: string[];
};

export type Product = {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: string;
  gender: 'men' | 'women';
  price: number;
  images: string[];
  colors?: ProductColor[];
  sizes: string[];
  stock: Record<string, number>;
  active: boolean;
  featured?: boolean;
  offer?: {
    active: boolean;
    discountedPrice: number;
    label: string;
    startDate: any;
    endDate: any;
  };
  createdAt?: any;
  [key: string]: any;
};

export type BrandSettings = {
  name: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  aboutAr: string;
  aboutEn: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubAr: string;
  heroSubEn: string;
  heroEyebrowAr: string;
  heroEyebrowEn: string;
  quoteAr: string;
  quoteEn: string;
  aboutQuoteAr: string;
  aboutQuoteEn: string;
  statProducts: string;
  statClients: string;
  statCotton: string;
  footerCopyrightAr: string;
  footerCopyrightEn: string;
  email: string;
  phone: string;
  whatsapp: string;
  whatsappUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  categoriesMen: string[];
  categoriesWomen: string[];
  menComingSoon: boolean;
  womenComingSoon: boolean;
  offersComingSoon: boolean;
  menComingSoonMessageAr: string;
  menComingSoonMessageEn: string;
  womenComingSoonMessageAr: string;
  womenComingSoonMessageEn: string;
  offersComingSoonMessageAr: string;
  offersComingSoonMessageEn: string;
  maintenanceMode: boolean;
  maintenanceTitleAr: string;
  maintenanceTitleEn: string;
  maintenanceTextAr: string;
  maintenanceTextEn: string;
  maintenanceImageUrl: string;
  maintenanceInstagram: string;
  maintenanceTiktok: string;
  maintenanceWhatsapp: string;
  privacyTitleAr: string;
  privacyTitleEn: string;
  termsTitleAr: string;
  termsTitleEn: string;
  restockMessageAr: string;
  restockMessageEn: string;
  coinRules: CoinRule[];
  coinValueEGP: number;
  [key: string]: any;
};

export type CoinRule = {
  id: string;
  conditionAr: string;
  conditionEn: string;
  coins: number;
  minOrderValue: number;
};

export type Order = {
  id: string;
  userId?: string;
  guestInfo: {
    name: string;
    phone: string;
    address: string;
    notes: string;
  };
  items: {
    productId: string;
    nameAr: string;
    nameEn: string;
    price: number;
    size: string;
    quantity: number;
    image: string;
    color?: string;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
  updatedAt?: any;
};

// ── BRAND SETTINGS ──

export async function getBrandSettings(): Promise<BrandSettings> {
  try {
    const snap = await getDoc(doc(db, 'setting', 'brand'));
    if (snap.exists()) return snap.data() as BrandSettings;
  } catch (e) { console.error(e); }
  return {
    name: 'زيّ', nameEn: 'Zayy',
    taglineAr: 'أناقة كلاسيكية', taglineEn: 'Classic Elegance',
    aboutAr: '', aboutEn: '',
    heroTitleAr: 'تجمّع الأناقة', heroTitleEn: 'WEAR BOLD',
    heroSubAr: '', heroSubEn: '',
    heroEyebrowAr: 'الموسم الجديد', heroEyebrowEn: 'New Season',
    quoteAr: '', quoteEn: '',
    aboutQuoteAr: '', aboutQuoteEn: '',
    statProducts: '+500', statClients: '+2K', statCotton: '100%',
    footerCopyrightAr: 'جميع الحقوق محفوظة',
    footerCopyrightEn: 'All rights reserved',
    email: '', phone: '', whatsapp: '', whatsappUrl: '',
    instagramUrl: '', tiktokUrl: '',
    categoriesMen: ['t-shirt', 'pants', 'hoodie', 'jacket'],
    categoriesWomen: ['t-shirt', 'pants', 'dress', 'jacket'],
    menComingSoon: false, womenComingSoon: false, offersComingSoon: false,
    menComingSoonMessageAr: 'قريباً', menComingSoonMessageEn: 'Coming Soon',
    womenComingSoonMessageAr: 'قريباً', womenComingSoonMessageEn: 'Coming Soon',
    offersComingSoonMessageAr: 'قريباً', offersComingSoonMessageEn: 'Coming Soon',
    maintenanceMode: false,
    maintenanceTitleAr: '', maintenanceTitleEn: '',
    maintenanceTextAr: '', maintenanceTextEn: '',
    maintenanceImageUrl: '', maintenanceInstagram: '',
    maintenanceTiktok: '', maintenanceWhatsapp: '',
    privacyTitleAr: 'سياسة الخصوصية', privacyTitleEn: 'Privacy Policy',
    termsTitleAr: 'الشروط والأحكام', termsTitleEn: 'Terms & Conditions',
    restockMessageAr: 'مرحباً! المنتج الذي اهتممت به عاد للمخزون. اطلبه الآن قبل نفاده!',
    restockMessageEn: 'Hi! The product you were interested in is back in stock. Order now before it sells out!',
    coinRules: [],
    coinValueEGP: 5,
  };
}

// ── PRODUCTS ──

export async function getAllProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), where('active', '==', true), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch { return []; }
}

export async function getMenProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), where('active', '==', true), where('gender', '==', 'men'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch { return []; }
}

export async function getWomenProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), where('active', '==', true), where('gender', '==', 'women'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch { return []; }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const snap = await getDoc(doc(db, 'products', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() } as Product;
    return null;
  } catch { return null; }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), where('active', '==', true), where('featured', '==', true), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch { return []; }
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), where('active', '==', true), where('gender', '==', product.gender), where('category', '==', product.category), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)).filter(p => p.id !== product.id).slice(0, 4);
  } catch { return []; }
}

// ── OFFER HELPERS ──

export function getActiveDiscountedPrice(product: Product): number | null {
  if (!product.offer?.active) return null;
  if (!product.offer.discountedPrice || product.offer.discountedPrice <= 0) return null;
  const now = new Date();
  try {
    const startRaw = product.offer.startDate;
    const endRaw = product.offer.endDate;
    if (!startRaw || !endRaw) return product.offer.discountedPrice;
    let start: Date;
    let end: Date;
    if (typeof startRaw === 'object' && startRaw !== null && 'toDate' in startRaw) {
      start = startRaw.toDate();
    } else {
      start = new Date(startRaw);
    }
    if (typeof endRaw === 'object' && endRaw !== null && 'toDate' in endRaw) {
      end = endRaw.toDate();
    } else {
      end = new Date(endRaw);
    }
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return product.offer.discountedPrice;
    if (now >= start && now <= end) return product.offer.discountedPrice;
    return null;
  } catch {
    return product.offer.discountedPrice;
  }
}

export function isLowStock(product: Product): boolean {
  if (!product.stock) return false;
  const total = Object.values(product.stock).reduce((a: number, b: number) => a + b, 0);
  return total > 0 && total < 10;
}

export function getLowStockCount(product: Product): number {
  if (!product.stock) return 0;
  return Object.values(product.stock).reduce((a: number, b: number) => a + b, 0);
}

export function isSizeAvailable(product: Product, size: string): boolean {
  return (product.stock?.[size] ?? 0) > 0;
}

export function getTotalStock(product: Product): number {
  if (!product.stock) return 0;
  return Object.values(product.stock).reduce((a: number, b: number) => a + b, 0);
}

// ── ORDERS ──

export async function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'orders'), {
    ...order,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
  } catch { return []; }
}

// ── RESTOCK ──

export async function subscribeToRestock(email: string, productId: string, productNameAr: string, productNameEn: string, size: string): Promise<void> {
  await addDoc(collection(db, 'restockRequests'), {
    email, productId, productNameAr, productNameEn, size,
    notified: false,
    createdAt: serverTimestamp(),
  });
}

// ── CATEGORY HELPERS ──

export const defaultCategoryLabels: Record<string, { ar: string; en: string; icon: string }> = {
  'all': { ar: 'الكل', en: 'All', icon: 'fa-grip' },
  't-shirt': { ar: 'تيشيرتات', en: 'T-Shirts', icon: 'fa-shirt' },
  'pants': { ar: 'بناطيل', en: 'Pants', icon: 'fa-person' },
  'hoodie': { ar: 'هوديز', en: 'Hoodies', icon: 'fa-vest' },
  'jacket': { ar: 'جاكيتات', en: 'Jackets', icon: 'fa-vest-patches' },
  'dress': { ar: 'فساتين', en: 'Dresses', icon: 'fa-person-dress' },
  'skirt': { ar: 'تنانير', en: 'Skirts', icon: 'fa-person-dress' },
  'top': { ar: 'توبات', en: 'Tops', icon: 'fa-shirt' },
  'shoes': { ar: 'أحذية', en: 'Shoes', icon: 'fa-shoe-prints' },
  'accessories': { ar: 'إكسسوارات', en: 'Accessories', icon: 'fa-gem' },
};

export function getCategoryLabel(id: string, lang: 'ar' | 'en'): string {
  return defaultCategoryLabels[id]?.[lang] || id;
}

export function getCategoryIcon(id: string): string {
  return defaultCategoryLabels[id]?.icon || 'fa-tag';
}