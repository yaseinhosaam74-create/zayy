'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { getBrandSettings, type BrandSettings } from '@/lib/firebase-store';

export default function AboutPage() {
  const [drawer, setDrawer] = useState(false);
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const { language } = useStore();
  const isRTL = language === 'ar';

  useEffect(() => {
    getBrandSettings().then(setBrand);
  }, []);

  const values = [
    { icon: 'fa-gem', titleAr: 'جودة فائقة', titleEn: 'Premium Quality', subAr: 'كل قطعة مصنوعة من أجود الخامات', subEn: 'Every piece crafted from the finest materials' },
    { icon: 'fa-leaf', titleAr: 'مستدام', titleEn: 'Sustainable', subAr: 'نهتم بكوكبنا والأجيال القادمة', subEn: 'We care about our planet and future generations' },
    { icon: 'fa-earth-africa', titleAr: 'أسلوب عالمي', titleEn: 'Global Style', subAr: 'مستوحى من ثقافة الشارع حول العالم', subEn: 'Inspired by street culture worldwide' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Header onMenuOpen={() => setDrawer(true)} />
      <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

      {/* Hero */}
      <section style={{ paddingTop: 54, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px 40px' }}>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Cairo' }}>
            {isRTL ? 'قصتنا' : 'Our Story'}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 38, color: '#fff', marginBottom: 16 }}>
            {isRTL ? 'من نحن' : 'About Us'}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontFamily: 'Cairo', fontWeight: 300, lineHeight: 1.9 }}>
            {isRTL ? brand?.aboutAr : brand?.aboutEn}
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, textAlign: 'center' }}>
          {[
{ num: brand?.statProducts || '+500', labelAr: 'منتج', labelEn: 'Products' },
{ num: brand?.statClients || '+2K', labelAr: 'عميل سعيد', labelEn: 'Happy Clients' },
{ num: brand?.statCotton || '100%', labelAr: 'قطن طبيعي', labelEn: 'Natural Cotton' },
          ].map((stat, i) => (
            <motion.div key={stat.num} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 28, color: 'var(--ink)', marginBottom: 4 }}>{stat.num}</p>
              <p style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo' }}>{isRTL ? stat.labelAr : stat.labelEn}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Cairo' }}>
            {isRTL ? 'ما نؤمن به' : 'What We Believe'}
          </p>
          <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 26, color: 'var(--ink)' }}>
            {isRTL ? 'قيمنا' : 'Our Values'}
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {values.map((val, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="info-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`fa-solid ${val.icon}`} style={{ fontSize: 20, color: 'var(--paper)' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>
                  {isRTL ? val.titleAr : val.titleEn}
                </p>
                <p style={{ fontFamily: 'Cairo', fontWeight: 300, fontSize: 13, color: 'var(--mid)', lineHeight: 1.7 }}>
                  {isRTL ? val.subAr : val.subEn}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote */}
      <section style={{ background: '#1a1a1a', padding: '56px 20px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <i className="fa-solid fa-quote-right" style={{ fontSize: 28, color: 'rgba(255,255,255,0.1)', marginBottom: 20, display: 'block' }} />
          <p style={{ fontFamily: 'Cairo', fontWeight: 300, fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 2, maxWidth: 480, margin: '0 auto 20px' }}>
            {isRTL
? (brand?.aboutQuoteAr || 'الفخامة الحقيقية لا تحتاج إلى صخب')
: (brand?.aboutQuoteEn || "True luxury doesn't shout")}
          </p>
          <p style={{ fontFamily: 'Cairo', fontWeight: 800, fontSize: 13, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>
            — {brand?.nameEn || 'ZAYY'} {brand?.name || 'زيّ'}
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}