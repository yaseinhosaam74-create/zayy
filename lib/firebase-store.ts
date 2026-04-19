import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

// ══════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════

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
  sizes: string[];
  stock: Record<string, number>;
  active: boolean;
  featured?: boolean;
  offer?: {
    active: boolean;
    discountedPrice: number;
    label: string;
    startDate: Timestamp;
    endDate: Timestamp;
  };
  createdAt?: Timestamp;
};

export type Category = {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
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
  instagramUrl: string;
  tiktokUrl: string;
  whatsappUrl: string;
  categoriesMen: string[];
  categoriesWomen: string[];
  // Privacy page
  privacyTitleAr: string;
  privacyTitleEn: string;
  privacyS1TitleAr: string;
  privacyS1TitleEn: string;
  privacyS1TextAr: string;
  privacyS1TextEn: string;
  privacyS2TitleAr: string;
  privacyS2TitleEn: string;
  privacyS2TextAr: string;
  privacyS2TextEn: string;
  privacyS3TitleAr: string;
  privacyS3TitleEn: string;
  privacyS3TextAr: string;
  privacyS3TextEn: string;
  privacyS4TitleAr: string;
  privacyS4TitleEn: string;
  privacyS4TextAr: string;
  privacyS4TextEn: string;
  privacyS5TitleAr: string;
  privacyS5TitleEn: string;
  privacyS5TextAr: string;
  privacyS5TextEn: string;
  privacyS6TitleAr: string;
  privacyS6TitleEn: string;
  privacyS6TextAr: string;
  privacyS6TextEn: string;
  // Terms page
  termsTitleAr: string;
  termsTitleEn: string;
  termsS1TitleAr: string;
  termsS1TitleEn: string;
  termsS1TextAr: string;
  termsS1TextEn: string;
  termsS2TitleAr: string;
  termsS2TitleEn: string;
  termsS2TextAr: string;
  termsS2TextEn: string;
  termsS3TitleAr: string;
  termsS3TitleEn: string;
  termsS3TextAr: string;
  termsS3TextEn: string;
  termsS4TitleAr: string;
  termsS4TitleEn: string;
  termsS4TextAr: string;
  termsS4TextEn: string;
  termsS5TitleAr: string;
  termsS5TitleEn: string;
  termsS5TextAr: string;
  termsS5TextEn: string;
  termsS6TitleAr: string;
  termsS6TitleEn: string;
  termsS6TextAr: string;
  termsS6TextEn: string;
  [key: string]: any;
};

// ══════════════════════════════════════════
// BRAND SETTINGS
// ══════════════════════════════════════════

export async function getBrandSettings(): Promise<BrandSettings> {
  try {
    const ref = doc(db, 'setting', 'brand');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as BrandSettings;
    }
  } catch (error) {
    console.error('Error fetching brand settings:', error);
  }
  return {
    name: 'زيّ',
    nameEn: 'Zayy',
    taglineAr: 'أناقة كلاسيكية',
    taglineEn: 'Classic Elegance',
    aboutAr: 'بين نقاء الخطوط وهدوء التصميم، ينبثق زيّ.',
    aboutEn: 'At the intersection of heritage and minimalism, Zayy emerges.',
    heroTitleAr: 'تجمّع الأناقة',
    heroTitleEn: 'WEAR BOLD',
    heroSubAr: 'الأناقة هي ما يتبقى عندما تتخلى عن كل ما هو زائد.',
    heroSubEn: 'Elegance is what remains when you remove the unnecessary.',
    heroEyebrowAr: 'الموسم الجديد وصل',
    heroEyebrowEn: 'New Season Has Arrived',
    email: 'zayyclothes.wear@gmail.com',
    phone: '+201121454510',
    whatsapp: '+201121454510',
    instagramUrl: 'https://www.instagram.com/_zayyclothes',
    tiktokUrl: 'https://www.tiktok.com',
    whatsappUrl: 'https://wa.me/201121454510',
    categoriesMen: ['t-shirt', 'pants', 'hoodie', 'jacket'],
    categoriesWomen: ['t-shirt', 'pants', 'hoodie', 'jacket'],
  };
}

// ══════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════

export async function getAllProducts(): Promise<Product[]> {
  try {
    const ref = collection(db, 'products');
    const q = query(ref, where('active', '==', true), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

export async function getMenProducts(): Promise<Product[]> {
  try {
    const ref = collection(db, 'products');
    const q = query(
      ref,
      where('active', '==', true),
      where('gender', '==', 'men'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    console.error('Error fetching men products:', error);
    return [];
  }
}

export async function getWomenProducts(): Promise<Product[]> {
  try {
    const ref = collection(db, 'products');
    const q = query(
      ref,
      where('active', '==', true),
      where('gender', '==', 'women'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    console.error('Error fetching women products:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const ref = doc(db, 'products', id);
    const snap = await getDoc(ref);
    if (snap.exists()) return { id: snap.id, ...snap.data() } as Product;
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const ref = collection(db, 'products');
    const q = query(
      ref,
      where('active', '==', true),
      where('featured', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  try {
    const ref = collection(db, 'products');
    const q = query(
      ref,
      where('active', '==', true),
      where('gender', '==', product.gender),
      where('category', '==', product.category),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Product))
      .filter(p => p.id !== product.id)
      .slice(0, 4);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

// ══════════════════════════════════════════
// OFFER HELPERS
// ══════════════════════════════════════════

export function getActiveDiscountedPrice(product: Product): number | null {
  if (!product.offer?.active) return null;
  const now = new Date();
  const start = product.offer.startDate?.toDate?.() ?? new Date(0);
  const end = product.offer.endDate?.toDate?.() ?? new Date(0);
  if (now >= start && now <= end) return product.offer.discountedPrice;
  return null;
}

export function isLowStock(product: Product): boolean {
  return Object.values(product.stock ?? {}).some(qty => qty > 0 && qty < 5);
}

export function isSizeAvailable(product: Product, size: string): boolean {
  return (product.stock?.[size] ?? 0) > 0;
}

// ══════════════════════════════════════════
// CATEGORY LABEL HELPERS
// ══════════════════════════════════════════

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