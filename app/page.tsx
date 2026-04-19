'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import SplashScreen from '@/components/SplashScreen';
import { useStore } from '@/store/useStore';
import {
  getBrandSettings,
  getFeaturedProducts,
  getActiveDiscountedPrice,
  isLowStock,
  type Product,
  type BrandSettings,
} from '@/lib/firebase-store';

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useStore();
  const isRTL = language === 'ar';

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('my-store-data') || '{}')?.state;
      if (s?.theme === 'dark') document.documentElement.classList.add('dark');
      if (s?.language === 'en') {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
      }
    } catch {}

    const load = async () => {
      const [b, f] = await Promise.all([
        getBrandSettings(),
        getFeaturedProducts(),
      ]);
      setBrand(b);
      setFeatured(f);
      setLoading(false);
    };
    load();
  }, []);

  const features = [
    { icon: 'fa-truck-fast', en: 'Free Shipping', ar: 'شحن مجاني', subEn: 'Over 500 EGP', subAr: 'فوق ٥٠٠ ج.م' },
    { icon: 'fa-rotate-left', en: 'Easy Returns', ar: 'إرجاع سهل', subEn: '14 days', subAr: '١٤ يوم' },
    { icon: 'fa-shield-halved', en: 'Secure Payment', ar: 'دفع آمن', subEn: '100% safe', subAr: 'آمن ١٠٠٪' },
    { icon: 'fa-headset', en: 'Support 24/7', ar: 'دعم ٢٤/٧', subEn: 'Always here', subAr: 'دائماً هنا' },
  ];

  return (
    <>
      <SplashScreen />
      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Header onMenuOpen={() => setDrawerOpen(true)} />
        <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

        {/* ── HERO ── */}
        <section style={{
          minHeight: '100svh',
          background: '#111111',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: 54,
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '0 20px', maxWidth: 600, margin: '0 auto' }}>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.3 }}
              style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 20, fontFamily: 'Cairo' }}
            >
              {isRTL
                ? (brand?.heroTitleAr ? 'الموسم الجديد وصل' : 'الموسم الجديد وصل')
                : 'New Season Has Arrived'}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4 }}
              style={{
                fontFamily: 'Cairo, sans-serif',
                fontWeight: 900,
                color: '#fff',
                lineHeight: 0.88,
                fontSize: 'clamp(64px, 17vw, 130px)',
                letterSpacing: '-0.02em',
                marginBottom: 22,
              }}
            >
              {loading ? (
                <span style={{ color: 'rgba(255,255,255,0.1)' }}>...</span>
              ) : isRTL ? (
                <>
                  {brand?.heroTitleAr?.split(' ')[0] || 'تجمّع'}
                  <br />
                  <span style={{ color: 'rgba(255,255,255,0.1)' }}>
                    {brand?.heroTitleAr?.split(' ')[1] || 'الأناقة'}
                  </span>
                </>
              ) : (
                <>
                  {brand?.heroTitleEn?.split(' ')[0] || 'WEAR'}
                  <br />
                  <span style={{ color: 'rgba(255,255,255,0.1)' }}>
                    {brand?.heroTitleEn?.split(' ')[1] || 'BOLD'}
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6 }}
              style={{
                color: 'rgba(255,255,255,0.28)',
                fontSize: 14,
                fontWeight: 300,
                lineHeight: 1.9,
                maxWidth: 340,
                margin: '0 auto 36px',
                fontFamily: 'Cairo',
              }}
            >
              {isRTL ? brand?.heroSubAr : brand?.heroSubEn}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8 }}
              style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link href="/men" style={{
                background: '#fff', color: '#111',
                fontFamily: 'Cairo', fontWeight: 700, fontSize: 12,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '14px 30px', borderRadius: 8, textDecoration: 'none',
              }}>
                {isRTL ? 'تسوق رجال' : 'Shop Men'}
              </Link>
              <Link href="/women" style={{
                border: '1.5px solid rgba(255,255,255,0.25)',
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'Cairo', fontWeight: 700, fontSize: 12,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '14px 30px', borderRadius: 8, textDecoration: 'none',
              }}>
                {isRTL ? 'تسوق نساء' : 'Shop Women'}
              </Link>
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: 'absolute', bottom: 28,
              left: '50%', transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.18)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
            }}
          >
            <span style={{ fontFamily: 'Cairo', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              {isRTL ? 'مرر' : 'scroll'}
            </span>
            <i className="fa-solid fa-chevron-down" style={{ fontSize: 11 }} />
          </motion.div>
        </section>

        {/* ── CATEGORIES ── */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 16px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { href: '/men', ar: 'رجال', en: 'MEN', bg: '#1a1a1a' },
              { href: '/women', ar: 'نساء', en: 'WOMEN', bg: '#2e2e2e' },
            ].map((cat, i) => (
              <motion.div
                key={cat.href}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={cat.href} style={{
                  display: 'flex', alignItems: 'flex-end',
                  height: 180, borderRadius: 12, overflow: 'hidden',
                  background: cat.bg, textDecoration: 'none',
                  padding: '0 0 20px 20px', position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)',
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{
                      fontFamily: 'Cairo', fontWeight: 900,
                      color: '#fff', fontSize: 28,
                      lineHeight: 1, marginBottom: 6,
                    }}>
                      {isRTL ? cat.ar : cat.en}
                    </h3>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      color: 'rgba(255,255,255,0.6)', fontSize: 11,
                      fontWeight: 600, letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>
                      {isRTL ? 'اكتشف التشكيلة' : 'Explore Collection'}
                      <i className={`fa-solid ${isRTL ? 'fa-arrow-left' : 'fa-arrow-right'}`} style={{ fontSize: 10 }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURED PRODUCTS ── */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '8px 16px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Cairo' }}>
                {isRTL ? 'مختارات' : 'Featured'}
              </p>
              <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 22, color: 'var(--ink)' }}>
                {isRTL ? 'العروض المميزة' : 'Top Picks'}
              </h2>
            </div>
            <Link href="/offers" style={{
              fontSize: 12, fontWeight: 700, color: 'var(--ink)',
              textDecoration: 'none', display: 'flex',
              alignItems: 'center', gap: 4,
            }}>
              {isRTL ? 'عرض الكل' : 'View All'}
              <i className={`fa-solid ${isRTL ? 'fa-arrow-left' : 'fa-arrow-right'}`} style={{ fontSize: 10 }} />
            </Link>
          </div>

          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  background: 'var(--paper-soft)',
                  borderRadius: 8,
                  aspectRatio: '3/4',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 0',
              color: 'var(--mid)', fontFamily: 'Cairo',
            }}>
              <i className="fa-solid fa-star" style={{ fontSize: 40, marginBottom: 16, display: 'block', color: 'var(--border)' }} />
              <p style={{ fontSize: 14 }}>
                {isRTL ? 'لا توجد منتجات مميزة بعد' : 'No featured products yet'}
              </p>
              <p style={{ fontSize: 12, marginTop: 8, color: 'var(--mid)' }}>
                {isRTL ? 'أضف منتجات من لوحة التحكم' : 'Add products from the admin panel'}
              </p>
            </div>
          ) : (
            <div className="product-grid">
              {featured.map((product, index) => (
                <FeaturedCard
                  key={product.id}
                  product={product}
                  index={index}
                  isRTL={isRTL}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── FEATURES STRIP ── */}
        <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            maxWidth: 1280, margin: '0 auto',
            padding: '36px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px 16px',
          }}>
            {features.map((f, i) => (
              <motion.div
                key={f.en}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8 }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'var(--paper-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`fa-solid ${f.icon}`} style={{ fontSize: 18, color: 'var(--ink)' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                    {isRTL ? f.ar : f.en}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--mid)', marginTop: 2, fontFamily: 'Cairo' }}>
                    {isRTL ? f.subAr : f.subEn}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── BRAND QUOTE ── */}
        <section style={{ background: '#f8f8f6', padding: '56px 20px', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <i className="fa-solid fa-quote-right" style={{ fontSize: 24, color: '#e8e8e4', marginBottom: 16, display: 'block' }} />
            <p style={{
              fontFamily: 'Cairo', fontWeight: 300, fontSize: 17,
              color: '#767676', lineHeight: 2,
              maxWidth: 440, margin: '0 auto 16px',
            }}>
              {isRTL
? (brand?.quoteAr || 'الفخامة الحقيقية لا تحتاج إلى صخب؛ بل تكمن في التفاصيل الصامتة')
: (brand?.quoteEn || "True luxury doesn't shout; it resonates through silent details")}
            </p>
            <p style={{ fontWeight: 800, fontSize: 12, color: '#1a1a1a', letterSpacing: '0.2em', fontFamily: 'Cairo' }}>
              — ZAYY زيّ
            </p>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  );
}

// ── Featured Product Card ──
function FeaturedCard({ product, index, isRTL }: { product: Product; index: number; isRTL: boolean }) {
  const { toggleWishlist, isInWishlist } = useStore();
  const inWishlist = isInWishlist(product.id);
  const discountedPrice = getActiveDiscountedPrice(product);
  const lowStock = isLowStock(product);

  const hasImage = product.images?.[0] &&
    (product.images[0].startsWith('http') || product.images[0].startsWith('/'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      style={{ display: 'flex', flexDirection: 'column', background: 'var(--card)' }}
    >
      <Link href={`/product/${product.id}`} style={{
        position: 'relative', display: 'block',
        overflow: 'hidden', background: 'var(--paper-soft)',
        aspectRatio: '3/4',
      }}>
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={isRTL ? product.nameAr : product.nameEn}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 8, background: '#f0f0ee',
          }}>
            <i className="fa-solid fa-shirt" style={{ fontSize: 32, color: '#c8c8c4' }} />
          </div>
        )}

        <div style={{ position: 'absolute', top: 8, insetInlineStart: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {discountedPrice && (
            <span className="badge-sale">{isRTL ? 'خصم' : 'SALE'}</span>
          )}
          {lowStock && (
            <span className="badge-stock">{isRTL ? 'كمية محدودة' : 'LOW STOCK'}</span>
          )}
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
          <i
            className={`${inWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`}
            style={{ fontSize: '13px', color: inWishlist ? '#fff' : '#1a1a1a' }}
          />
        </motion.button>
      </Link>

      <div style={{ padding: '10px 4px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: 13, fontWeight: 600, color: 'var(--ink)',
            lineHeight: 1.4, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', fontFamily: 'Cairo, sans-serif',
          }}>
            {isRTL ? product.nameAr : product.nameEn}
          </h3>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {discountedPrice ? (
            <>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                {discountedPrice} {isRTL ? 'ج.م' : 'EGP'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--mid)', textDecoration: 'line-through', fontFamily: 'Cairo' }}>
                {product.price}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>
              {product.price} {isRTL ? 'ج.م' : 'EGP'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 2 }}>
          {product.sizes?.slice(0, 4).map(s => (
            <span key={s} style={{
              fontSize: 10, color: 'var(--mid)',
              border: '1px solid var(--border)',
              borderRadius: 3, padding: '1px 5px',
              fontFamily: 'Cairo',
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}