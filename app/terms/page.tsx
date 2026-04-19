'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { useStore } from '@/store/useStore';
import { getBrandSettings, type BrandSettings } from '@/lib/firebase-store';
import { motion } from 'framer-motion';

export default function TermsPage() {
  const [drawer, setDrawer] = useState(false);
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const { language } = useStore();
  const isRTL = language === 'ar';

  useEffect(() => {
    getBrandSettings().then(setBrand);
  }, []);

  const sections = [
    {
      icon: 'fa-handshake',
      titleAr: brand?.termsS1TitleAr || 'قبول الشروط',
      titleEn: brand?.termsS1TitleEn || 'Acceptance of Terms',
      textAr: brand?.termsS1TextAr || 'باستخدامك لموقع زيّ، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.',
      textEn: brand?.termsS1TextEn || 'By using Zayy, you agree to be bound by these terms and conditions. If you do not agree to any of these terms, please do not use the site.',
    },
    {
      icon: 'fa-credit-card',
      titleAr: brand?.termsS2TitleAr || 'الطلبات والدفع',
      titleEn: brand?.termsS2TitleEn || 'Orders & Payment',
      textAr: brand?.termsS2TextAr || 'جميع الطلبات تخضع للتوافر. نحتفظ بحق رفض أي طلب. الأسعار قابلة للتغيير دون إشعار مسبق. جميع المدفوعات مشفرة وآمنة.',
      textEn: brand?.termsS2TextEn || 'All orders are subject to availability. We reserve the right to refuse any order. Prices are subject to change without notice. All payments are encrypted and secure.',
    },
    {
      icon: 'fa-truck-fast',
      titleAr: brand?.termsS3TitleAr || 'الشحن والتوصيل',
      titleEn: brand?.termsS3TitleEn || 'Shipping & Delivery',
      textAr: brand?.termsS3TextAr || 'نوفر شحناً مجانياً على الطلبات التي تزيد عن 500 ج.م. مواعيد التوصيل تقديرية وقد تتأثر بظروف خارجة عن إرادتنا.',
      textEn: brand?.termsS3TextEn || 'We offer free shipping on orders over 500 EGP. Delivery times are estimates and may be affected by circumstances beyond our control.',
    },
    {
      icon: 'fa-rotate-left',
      titleAr: brand?.termsS4TitleAr || 'سياسة الإرجاع',
      titleEn: brand?.termsS4TitleEn || 'Return Policy',
      textAr: brand?.termsS4TextAr || 'يمكنك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام، بشرط أن تكون بحالتها الأصلية غير مستخدمة وبعبوتها الأصلية.',
      textEn: brand?.termsS4TextEn || 'You may return products within 14 days of receipt, provided they are in their original unused condition and original packaging.',
    },
    {
      icon: 'fa-copyright',
      titleAr: brand?.termsS5TitleAr || 'الملكية الفكرية',
      titleEn: brand?.termsS5TitleEn || 'Intellectual Property',
      textAr: brand?.termsS5TextAr || 'جميع المحتويات على موقع زيّ، بما في ذلك الصور والنصوص والشعارات، هي ملك حصري لزيّ ومحمية بموجب قوانين حقوق النشر.',
      textEn: brand?.termsS5TextEn || 'All content on the Zayy website, including images, text, and logos, is the exclusive property of Zayy and is protected by copyright laws.',
    },
    {
      icon: 'fa-pen-to-square',
      titleAr: brand?.termsS6TitleAr || 'تعديل الشروط',
      titleEn: brand?.termsS6TitleEn || 'Modification of Terms',
      textAr: brand?.termsS6TextAr || 'نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع.',
      textEn: brand?.termsS6TextEn || 'We reserve the right to modify these terms at any time. You will be notified of any material changes via email or notice on the site.',
    },
  ];

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Header onMenuOpen={() => setDrawer(true)} />
        <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

        {/* Hero */}
        <section style={{
          paddingTop: 54,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 20px 32px' }}>
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Cairo' }}>
              {isRTL ? 'قانوني' : 'Legal'}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 34, color: '#fff', marginBottom: 10 }}>
              {isRTL
                ? (brand?.termsTitleAr || 'الشروط والأحكام')
                : (brand?.termsTitleEn || 'Terms & Conditions')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: 'Cairo' }}>
              {isRTL ? 'آخر تحديث: أبريل 2026' : 'Last updated: April 2026'}
            </motion.p>
          </div>
        </section>

        {/* Content */}
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 80px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: 'var(--paper-soft)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 14, padding: '20px',
                  display: 'flex', gap: 16,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <i className={`fa-solid ${s.icon}`} style={{ fontSize: 18, color: 'var(--paper)' }} />
                </div>
                <div>
                  <h2 style={{
                    fontFamily: 'Cairo', fontWeight: 700,
                    fontSize: 15, color: 'var(--ink)', marginBottom: 8,
                  }}>
                    {isRTL ? s.titleAr : s.titleEn}
                  </h2>
                  <p style={{
                    fontFamily: 'Cairo', fontWeight: 300,
                    fontSize: 13, color: 'var(--mid)', lineHeight: 1.9,
                  }}>
                    {isRTL ? s.textAr : s.textEn}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}