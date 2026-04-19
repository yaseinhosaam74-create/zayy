'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import {
  getWomenProducts,
  getBrandSettings,
  getActiveDiscountedPrice,
  isLowStock,
  getCategoryLabel,
  getCategoryIcon,
  type Product,
} from '@/lib/firebase-store';

export default function WomenPage() {
  const [drawer, setDrawer] = useState(false);
  const [cat, setCat] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useStore();
  const isRTL = language === 'ar';

  useEffect(() => {
    const load = async () => {
      const [data, brand] = await Promise.all([
        getWomenProducts(),
        getBrandSettings(),
      ]);
      setProducts(data);
      setCategories(brand.categoriesWomen || ['t-shirt', 'pants', 'hoodie', 'jacket']);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
  const allCats = ['all', ...categories];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Header onMenuOpen={() => setDrawer(true)} />
      <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

      <section style={{ paddingTop: 54, background: 'linear-gradient(135deg, #2d1f1f 0%, #3d2a2a 100%)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px 28px' }}>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Cairo' }}>
            {isRTL ? 'تشكيلة' : 'Collection'}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 40, color: '#fff', marginBottom: 6 }}>
            {isRTL ? 'نساء' : "WOMEN'S"}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: 'Cairo' }}>
            {loading ? '...' : `${products.length} ${isRTL ? 'منتج' : 'products'}`}
          </motion.p>
        </div>
      </section>

      <section style={{ position: 'sticky', top: 54, zIndex: 40, background: 'var(--paper)', borderBottom: '1px solid var(--border)', padding: '10px 16px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 8, overflowX: 'auto' }} className="scrollbar-hide">
          {allCats.map(c => (
            <button key={c} onClick={() => setCat(c)} className={`cat-pill ${cat === c ? 'active' : ''}`}>
              <i className={`fa-solid ${getCategoryIcon(c)}`} style={{ fontSize: 11 }} />
              {isRTL ? getCategoryLabel(c, 'ar') : getCategoryLabel(c, 'en')}
            </button>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 60px' }}>
        <p style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 20, fontFamily: 'Cairo' }}>
          {loading ? '...' : `${filtered.length} ${isRTL ? 'منتج' : 'products'}`}
        </p>

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map(i => <div key={i} style={{ background: 'var(--paper-soft)', borderRadius: 8, aspectRatio: '3/4' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--paper-soft)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-box-open" style={{ fontSize: 24, color: 'var(--mid)' }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', fontFamily: 'Cairo' }}>
              {isRTL ? 'لا توجد منتجات في هذا التصنيف' : 'No products in this category'}
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((product, i) => <ProductCard key={product.id} product={product} index={i} isRTL={isRTL} />)}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function ProductCard({ product, index, isRTL }: { product: Product; index: number; isRTL: boolean }) {
  const { toggleWishlist, isInWishlist } = useStore();
  const inWishlist = isInWishlist(product.id);
  const discountedPrice = getActiveDiscountedPrice(product);
  const lowStock = isLowStock(product);
  const hasImage = product.images?.[0] && (product.images[0].startsWith('http') || product.images[0].startsWith('/'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      style={{ display: 'flex', flexDirection: 'column', background: 'var(--card)' }}
    >
      <Link href={`/product/${product.id}`} style={{ position: 'relative', display: 'block', overflow: 'hidden', background: 'var(--paper-soft)', aspectRatio: '3/4' }}>
        {hasImage ? (
          <Image src={product.images[0]} alt={isRTL ? product.nameAr : product.nameEn} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0ee' }}>
            <i className="fa-solid fa-shirt" style={{ fontSize: 32, color: '#c8c8c4' }} />
          </div>
        )}
        <div style={{ position: 'absolute', top: 8, insetInlineStart: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {discountedPrice && <span className="badge-sale">{isRTL ? 'خصم' : 'SALE'}</span>}
          {lowStock && <span className="badge-stock">{isRTL ? 'كمية محدودة' : 'LOW STOCK'}</span>}
        </div>
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
          style={{
            position: 'absolute', top: '8px', insetInlineEnd: '8px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: inWishlist ? '#1a1a1a' : 'rgba(255,255,255,0.92)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 2,
          }}
        >
          <i className={`${inWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`} style={{ fontSize: '13px', color: inWishlist ? '#fff' : '#1a1a1a' }} />
        </motion.button>
      </Link>

      <div style={{ padding: '10px 4px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'Cairo' }}>
            {isRTL ? product.nameAr : product.nameEn}
          </h3>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {discountedPrice ? (
            <>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>{discountedPrice} {isRTL ? 'ج.م' : 'EGP'}</span>
              <span style={{ fontSize: 12, color: 'var(--mid)', textDecoration: 'line-through', fontFamily: 'Cairo' }}>{product.price}</span>
            </>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>{product.price} {isRTL ? 'ج.م' : 'EGP'}</span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 2 }}>
          {product.sizes?.slice(0, 4).map(s => (
            <span key={s} style={{ fontSize: 10, color: 'var(--mid)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', fontFamily: 'Cairo' }}>{s}</span>
          ))}
          {product.sizes?.length > 4 && <span style={{ fontSize: 10, color: 'var(--mid)', fontFamily: 'Cairo' }}>+{product.sizes.length - 4}</span>}
        </div>
      </div>
    </motion.div>
  );
}