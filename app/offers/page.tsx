'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import PageTransition from '@/components/PageTransition';
import { getFeaturedProducts, getBrandSettings, type Product, type BrandSettings } from '@/lib/firebase-store';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

export default function OffersPage() {
  const [drawer, setDrawer] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useStore();
  const isRTL = language === 'ar';

  useEffect(() => {
    const load = async () => {
      const [data, b] = await Promise.all([getFeaturedProducts(), getBrandSettings()]);
      setProducts(data);
      setBrand(b);
      setLoading(false);
    };
    load();
  }, []);

  if (!loading && brand?.offersComingSoon) {
    return (
      <PageTransition>
        <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
          <Header onMenuOpen={() => setDrawer(true)} />
          <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 20, padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--paper-soft)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <i className="fa-solid fa-tag" style={{ fontSize: 32, color: 'var(--mid)' }} />
              </div>
              <h1 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 32, color: 'var(--ink)', marginBottom: 12 }}>
                {isRTL ? (brand?.offersComingSoonMessageAr || 'قريباً') : (brand?.offersComingSoonMessageEn || 'Coming Soon')}
              </h1>
              <p style={{ fontFamily: 'Cairo', fontSize: 14, color: 'var(--mid)' }}>
                {isRTL ? 'العروض غير متاحة حالياً' : 'Offers are not available yet'}
              </p>
            </motion.div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Header onMenuOpen={() => setDrawer(true)} />
        <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

        <section style={{ paddingTop: 54, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px 28px' }}>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Cairo' }}>
              {isRTL ? 'تخفيضات حصرية' : 'Exclusive Deals'}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 40, color: '#fff', marginBottom: 6 }}>
              {isRTL ? 'العروض' : 'OFFERS'}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: 'Cairo' }}>
              {loading ? '...' : `${products.length} ${isRTL ? 'منتج' : 'products'}`}
            </motion.p>
          </div>
        </section>

        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 60px' }}>
          {loading ? (
            <div className="product-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ background: 'var(--paper-soft)', borderRadius: 8, aspectRatio: '3/4' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 16 }}>
              <i className="fa-solid fa-tag" style={{ fontSize: 48, color: 'var(--border)' }} />
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                {isRTL ? 'لا توجد عروض حالياً' : 'No offers available right now'}
              </p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}