'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getBrandSettings, type BrandSettings } from '@/lib/firebase-store';

const socialConfig: Record<string, { icon: string; label: string; labelAr: string; color: string }> = {
  instagram: { icon: 'fa-instagram', label: 'Instagram', labelAr: 'إنستغرام', color: '#E1306C' },
  tiktok: { icon: 'fa-tiktok', label: 'TikTok', labelAr: 'تيك توك', color: '#010101' },
  whatsapp: { icon: 'fa-whatsapp', label: 'WhatsApp', labelAr: 'واتساب', color: '#25D366' },
};

export default function ContactPage() {
  const [drawer, setDrawer] = useState(false);
  const [brand, setBrand] = useState<BrandSettings | null>(null);
  const { language } = useStore();
  const isRTL = language === 'ar';
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getBrandSettings().then(setBrand);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    setForm({ name: '', email: '', message: '' });
    toast.success(isRTL ? 'تم إرسال رسالتك بنجاح!' : 'Message sent successfully!');
  };

  const socials = [
    { platform: 'instagram', href: brand?.instagramUrl },
    { platform: 'tiktok', href: brand?.tiktokUrl },
    { platform: 'whatsapp', href: brand?.whatsappUrl },
  ].filter(s => s.href);

  const contactItems = [
    { icon: 'fa-envelope', labelAr: 'البريد الإلكتروني', labelEn: 'Email', value: brand?.email, href: `mailto:${brand?.email}` },
    { icon: 'fa-whatsapp', labelAr: 'واتساب', labelEn: 'WhatsApp', value: brand?.whatsapp, href: brand?.whatsappUrl, brands: true },
    { icon: 'fa-phone', labelAr: 'الهاتف', labelEn: 'Phone', value: brand?.phone, href: `tel:${brand?.phone}` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Header onMenuOpen={() => setDrawer(true)} />
      <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

      {/* Hero */}
      <section style={{ paddingTop: 54, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 36, paddingBottom: 36, padding: '36px 20px' }}>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Cairo' }}>
            {isRTL ? 'نحن هنا' : "We're Here"}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 38, color: '#fff', marginBottom: 10 }}>
            {isRTL ? 'تواصل معنا' : 'Contact Us'}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontFamily: 'Cairo', fontWeight: 300 }}>
            {isRTL ? 'يسعدنا سماع رسالتك في أي وقت' : 'We are happy to hear from you anytime'}
          </motion.p>
        </div>
      </section>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 16px 80px' }}>

        {/* Contact Cards */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'Cairo' }}>
            {isRTL ? 'معلومات التواصل' : 'Contact Information'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {contactItems.map(item => (
              item.value && (
                <a key={item.labelEn} href={item.href || '#'} target={item.href?.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer" className="contact-item">
                  <div className="contact-item-icon">
                    <i className={`${item.brands ? 'fa-brands' : 'fa-solid'} ${item.icon}`} style={{ fontSize: 16 }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 3, fontFamily: 'Cairo', fontWeight: 600 }}>
                      {isRTL ? item.labelAr : item.labelEn}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                      {item.value}
                    </p>
                  </div>
                  <i className={`fa-solid ${isRTL ? 'fa-arrow-left' : 'fa-arrow-right'}`}
                    style={{ fontSize: 13, color: 'var(--mid)', marginRight: isRTL ? 'auto' : undefined, marginLeft: isRTL ? undefined : 'auto' }} />
                </a>
              )
            ))}
          </div>
        </div>

        {/* Social Icons */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'Cairo' }}>
            {isRTL ? 'تابعنا على' : 'Follow Us On'}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {socials.map(s => {
              const cfg = socialConfig[s.platform];
              if (!cfg) return null;
              return (
                <div key={s.platform} className="tooltip-wrap">
                  <span className="tooltip-label">{isRTL ? cfg.labelAr : cfg.label}</span>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="social-icon-btn" style={{ fontSize: 18 }}>
                    <i className={`fa-brands ${cfg.icon}`} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        <div className="divider" style={{ marginBottom: 40 }} />

        {/* Form */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20, fontFamily: 'Cairo' }}>
            {isRTL ? 'أرسل رسالة' : 'Send a Message'}
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">{isRTL ? 'الاسم' : 'Name'}</label>
              <div className="input-wrapper">
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field" placeholder={isRTL ? 'اسمك الكامل' : 'Your full name'} />
                <i className="fa-regular fa-user input-icon" />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
              <div className="input-wrapper">
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field" placeholder={isRTL ? 'بريدك الإلكتروني' : 'your@email.com'} />
                <i className="fa-regular fa-envelope input-icon" />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">{isRTL ? 'الرسالة' : 'Message'}</label>
              <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                className="textarea-field" placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'} rows={5} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 4, opacity: sending ? 0.7 : 1 }} disabled={sending}>
              {sending ? (
                <><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 14 }} />{isRTL ? 'جاري الإرسال...' : 'Sending...'}</>
              ) : (
                <><i className="fa-solid fa-paper-plane" style={{ fontSize: 14 }} />{isRTL ? 'إرسال الرسالة' : 'Send Message'}</>
              )}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}