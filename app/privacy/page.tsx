'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { useStore } from '@/store/useStore';
import { getBrandSettings, type BrandSettings } from '@/lib/firebase-store';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
  const [drawer, setDrawer] = useState(false);
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const { language } = useStore();
  const isRTL = language === 'ar';

  useEffect(() => {
    getBrandSettings().then(setBrand);
  }, []);

  const sections = [
    {
      icon: 'fa-database',
      titleAr: brand?.privacyS1TitleAr || 'جمع المعلومات',
      titleEn: brand?.privacyS1TitleEn || 'Information Collection',
      textAr: brand?.privacyS1TextAr || 'نقوم بجمع المعلومات التي تقدمها مباشرة لنا عند إنشاء حساب، مثل الاسم والبريد الإلكتروني. لا نشارك بياناتك الشخصية مع أطراف ثالثة دون موافقتك.',
      textEn: brand?.privacyS1TextEn || 'We collect information you provide directly to us when creating an account, such as your name and email. We do not share your personal data with third parties without your consent.',
    },
    {
      icon: 'fa-gears',
      titleAr: brand?.privacyS2TitleAr || 'استخدام المعلومات',
      titleEn: brand?.privacyS2TitleEn || 'Use of Information',
      textAr: brand?.privacyS2TextAr || 'نستخدم معلوماتك لمعالجة الطلبات، وتحسين خدماتنا، وإرسال تحديثات متعلقة بطلباتك فقط.',
      textEn: brand?.privacyS2TextEn || 'We use your information to process orders, improve our services, and send updates related to your orders only.',
    },
    {
      icon: 'fa-cookie-bite',
      titleAr: brand?.privacyS3TitleAr || 'ملفات تعريف الارتباط',
      titleEn: brand?.privacyS3TitleEn || 'Cookies',
      textAr: brand?.privacyS3TextAr || 'نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وحفظ تفضيلاتك مثل اللغة والوضع المظلم.',
      textEn: brand?.privacyS3TextEn || 'We use cookies to improve your browsing experience and save your preferences such as language and dark mode.',
    },
    {
      icon: 'fa-lock',
      titleAr: brand?.privacyS4TitleAr || 'أمان البيانات',
      titleEn: brand?.privacyS4TitleEn || 'Data Security',
      textAr: brand?.privacyS4TextAr || 'نحن نستخدم تشفير SSL وخدمات Firebase من Google لحماية بياناتك. جميع المعاملات المالية مشفرة بالكامل.',
      textEn: brand?.privacyS4TextEn || 'We use SSL encryption and Google Firebase services to protect your data. All financial transactions are fully encrypted.',
    },
    {
      icon: 'fa-user-shield',
      titleAr: brand?.privacyS5TitleAr || 'حقوقك',
      titleEn: brand?.privacyS5TitleEn || 'Your Rights',
      textAr: brand?.privacyS5TextAr || 'يحق لك طلب حذف حسابك وجميع بياناتك الشخصية في أي وقت من خلال صفحة الحساب.',
      textEn: brand?.privacyS5TextEn || 'You have the right to request deletion of your account and all personal data at any time through the account page.',
    },
    {
      icon: 'fa-envelope',
      titleAr: brand?.privacyS6TitleAr || 'التواصل معنا',
      titleEn: brand?.privacyS6TitleEn || 'Contact Us',
      textAr: brand?.privacyS6TextAr || `إذا كان لديك أي أسئلة حول سياسة الخصوصية، تواصل معنا على: ${brand?.email || 'zayyclothes.wear@gmail.com'}`,
      textEn: brand?.privacyS6TextEn || `If you have any questions about our privacy policy, contact us at: ${brand?.email || 'zayyclothes.wear@gmail.com'}`,
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
                ? (brand?.privacyTitleAr || 'سياسة الخصوصية')
                : (brand?.privacyTitleEn || 'Privacy Policy')}
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