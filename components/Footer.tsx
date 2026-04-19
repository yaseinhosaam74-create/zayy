'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { getBrandSettings, type BrandSettings } from '@/lib/firebase-store';

const socialConfig: Record<string, { icon: string; label: string; labelAr: string }> = {
  instagram: { icon: 'fa-instagram', label: 'Instagram', labelAr: 'إنستغرام' },
  tiktok: { icon: 'fa-tiktok', label: 'TikTok', labelAr: 'تيك توك' },
  whatsapp: { icon: 'fa-whatsapp', label: 'WhatsApp', labelAr: 'واتساب' },
};

const quickLinks = [
  { href: '/', label: 'Home', labelAr: 'الرئيسية', icon: 'fa-house' },
  { href: '/men', label: 'Men', labelAr: 'رجال', icon: 'fa-person' },
  { href: '/women', label: 'Women', labelAr: 'نساء', icon: 'fa-person-dress' },
  { href: '/offers', label: 'Offers', labelAr: 'العروض', icon: 'fa-tag' },
  { href: '/about', label: 'About', labelAr: 'من نحن', icon: 'fa-circle-info' },
  { href: '/contact', label: 'Contact', labelAr: 'تواصل', icon: 'fa-envelope' },
  { href: '/privacy', label: 'Privacy', labelAr: 'الخصوصية', icon: 'fa-shield-halved' },
  { href: '/terms', label: 'Terms', labelAr: 'الشروط', icon: 'fa-file-contract' },
];

export default function Footer() {
  const { language } = useStore();
  const isRTL = language === 'ar';
  const [brand, setBrand] = useState<BrandSettings | null>(null);

  useEffect(() => {
    getBrandSettings().then(setBrand);
  }, []);

  const socials = [
    { platform: 'instagram', href: brand?.instagramUrl },
    { platform: 'tiktok', href: brand?.tiktokUrl },
    { platform: 'whatsapp', href: brand?.whatsappUrl },
  ].filter(s => s.href);

  return (
    <footer style={{
      background: '#111111',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '32px 20px 24px',
    }}>
      <div style={{
        maxWidth: 640, margin: '0 auto',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 28,
      }}>

        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <p style={{
              fontFamily: 'Cairo, sans-serif', fontWeight: 900,
              fontSize: 32, color: '#ffffff', lineHeight: 1, marginBottom: 6,
            }}>
              {brand?.name || 'زيّ'}
            </p>
          </Link>
          <p style={{
            fontSize: 11, color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.25em', textTransform: 'uppercase',
            fontFamily: 'Cairo, sans-serif',
          }}>
            {isRTL
              ? (brand?.taglineAr || 'أناقة كلاسيكية')
              : (brand?.taglineEn || 'Classic Elegance')}
          </p>
        </div>

        {/* Quick Links */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 8, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {quickLinks.map(link => (
            <div key={link.href} className="tooltip-wrap">
              <span className="tooltip-label">
                {isRTL ? link.labelAr : link.label}
              </span>
              <Link
                href={link.href}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', fontSize: 15,
                  textDecoration: 'none', transition: 'all 0.2s ease',
                }}
              >
                <i className={`fa-solid ${link.icon}`} />
              </Link>
            </div>
          ))}
        </div>

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)' }} />

        {/* Social Icons */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 10, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {socials.map(s => {
            const cfg = socialConfig[s.platform];
            if (!cfg || !s.href) return null;
            return (
              <div key={s.platform} className="tooltip-wrap">
                <span className="tooltip-label">
                  {isRTL ? cfg.labelAr : cfg.label}
                </span>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.55)', fontSize: 18,
                    textDecoration: 'none', transition: 'all 0.2s ease',
                  }}
                >
                  <i className={`fa-brands ${cfg.icon}`} />
                </a>
              </div>
            );
          })}
        </div>

        {/* Legal Links */}
        <div style={{
          display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <Link href="/privacy" style={{
            fontSize: 11, color: 'rgba(255,255,255,0.25)',
            textDecoration: 'none', fontFamily: 'Cairo',
            transition: 'color 0.2s',
          }}>
            {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 11 }}>·</span>
          <Link href="/terms" style={{
            fontSize: 11, color: 'rgba(255,255,255,0.25)',
            textDecoration: 'none', fontFamily: 'Cairo',
            transition: 'color 0.2s',
          }}>
            {isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}
          </Link>
        </div>

        {/* Copyright */}
        <p style={{
          fontSize: 12, color: 'rgba(255,255,255,0.2)',
          textAlign: 'center', fontFamily: 'Cairo, sans-serif',
        }}>
          {isRTL
            ? `© ${new Date().getFullYear()} ${brand?.name || 'زيّ'} — ${brand?.footerCopyrightAr || 'جميع الحقوق محفوظة'}`
            : `© ${new Date().getFullYear()} ${brand?.nameEn || 'Zayy'} — ${brand?.footerCopyrightEn || 'All rights reserved'}`}
        </p>

      </div>
    </footer>
  );
}