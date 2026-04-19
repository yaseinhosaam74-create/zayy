'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

export default function TermsPage() {
  const [drawer, setDrawer] = useState(false);
  const { language } = useStore();
  const isRTL = language === 'ar';

  const sections = [
    {
      titleAr: 'قبول الشروط',
      titleEn: 'Acceptance of Terms',
      textAr: 'باستخدامك لموقع زيّ، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.',
      textEn: 'By using Zayy, you agree to be bound by these terms and conditions. If you do not agree to any of these terms, please do not use the site.',
    },
    {
      titleAr: 'الطلبات والدفع',
      titleEn: 'Orders & Payment',
      textAr: 'جميع الطلبات تخضع للتوافر. نحتفظ بحق رفض أي طلب. الأسعار قابلة للتغيير دون إشعار مسبق. جميع المدفوعات مشفرة وآمنة.',
      textEn: 'All orders are subject to availability. We reserve the right to refuse any order. Prices are subject to change without notice. All payments are encrypted and secure.',
    },
    {
      titleAr: 'الشحن والتوصيل',
      titleEn: 'Shipping & Delivery',
      textAr: 'نوفر شحناً مجانياً على الطلبات التي تزيد عن 500 ج.م. مواعيد التوصيل تقديرية وقد تتأثر بظروف خارجة عن إرادتنا.',
      textEn: 'We offer free shipping on orders over 500 EGP. Delivery times are estimates and may be affected by circumstances beyond our control.',
    },
    {
      titleAr: 'سياسة الإرجاع',
      titleEn: 'Return Policy',
      textAr: 'يمكنك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام، بشرط أن تكون بحالتها الأصلية غير مستخدمة وبعبوتها الأصلية.',
      textEn: 'You may return products within 14 days of receipt, provided they are in their original unused condition and original packaging.',
    },
    {
      titleAr: 'الملكية الفكرية',
      titleEn: 'Intellectual Property',
      textAr: 'جميع المحتويات على موقع زيّ، بما في ذلك الصور والنصوص والشعارات، هي ملك حصري لزيّ ومحمية بموجب قوانين حقوق النشر.',
      textEn: 'All content on the Zayy website, including images, text, and logos, is the exclusive property of Zayy and is protected by copyright laws.',
    },
    {
      titleAr: 'تعديل الشروط',
      titleEn: 'Modification of Terms',
      textAr: 'نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع.',
      textEn: 'We reserve the right to modify these terms at any time. You will be notified of any material changes via email or notice on the site.',
    },
  ];

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Header onMenuOpen={() => setDrawer(true)} />
        <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

        <section style={{ paddingTop: 54, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 20px 32px' }}>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Cairo' }}>
              {isRTL ? 'قانوني' : 'Legal'}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 34, color: '#fff', marginBottom: 10 }}>
              {isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: 'Cairo' }}>
              {isRTL ? 'آخر تحديث: أبريل 2026' : 'Last updated: April 2026'}
            </motion.p>
          </div>
        </section>

        <section style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 80px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {sections.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                style={{
                  background: 'var(--paper-soft)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 14, padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 12, fontWeight: 900,
                    color: 'var(--paper)', fontFamily: 'Cairo',
                  }}>
                    {i + 1}
                  </div>
                  <h2 style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>
                    {isRTL ? s.titleAr : s.titleEn}
                  </h2>
                </div>
                <p style={{ fontFamily: 'Cairo', fontWeight: 300, fontSize: 14, color: 'var(--mid)', lineHeight: 1.9 }}>
                  {isRTL ? s.textAr : s.textEn}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}