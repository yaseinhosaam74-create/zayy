'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

export default function PrivacyPage() {
  const [drawer, setDrawer] = useState(false);
  const { language } = useStore();
  const isRTL = language === 'ar';

  const sections = [
    {
      titleAr: 'جمع المعلومات',
      titleEn: 'Information Collection',
      textAr: 'نقوم بجمع المعلومات التي تقدمها مباشرة لنا عند إنشاء حساب، مثل الاسم والبريد الإلكتروني. لا نشارك بياناتك الشخصية مع أطراف ثالثة دون موافقتك.',
      textEn: 'We collect information you provide directly to us when creating an account, such as your name and email. We do not share your personal data with third parties without your consent.',
    },
    {
      titleAr: 'استخدام المعلومات',
      titleEn: 'Use of Information',
      textAr: 'نستخدم معلوماتك لمعالجة الطلبات، وتحسين خدماتنا، وإرسال تحديثات متعلقة بطلباتك فقط.',
      textEn: 'We use your information to process orders, improve our services, and send updates related to your orders only.',
    },
    {
      titleAr: 'ملفات تعريف الارتباط',
      titleEn: 'Cookies',
      textAr: 'نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وحفظ تفضيلاتك مثل اللغة والوضع المظلم.',
      textEn: 'We use cookies to improve your browsing experience and save your preferences such as language and dark mode.',
    },
    {
      titleAr: 'أمان البيانات',
      titleEn: 'Data Security',
      textAr: 'نحن نستخدم تشفير SSL وخدمات Firebase من Google لحماية بياناتك. جميع المعاملات المالية مشفرة بالكامل.',
      textEn: 'We use SSL encryption and Google Firebase services to protect your data. All financial transactions are fully encrypted.',
    },
    {
      titleAr: 'حقوقك',
      titleEn: 'Your Rights',
      textAr: 'يحق لك طلب حذف حسابك وجميع بياناتك الشخصية في أي وقت من خلال صفحة الحساب.',
      textEn: 'You have the right to request deletion of your account and all personal data at any time through the account page.',
    },
    {
      titleAr: 'التواصل معنا',
      titleEn: 'Contact Us',
      textAr: 'إذا كان لديك أي أسئلة حول سياسة الخصوصية، تواصل معنا على: zayyclothes.wear@gmail.com',
      textEn: 'If you have any questions about our privacy policy, contact us at: zayyclothes.wear@gmail.com',
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
              {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
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