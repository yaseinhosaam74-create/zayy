'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { getBrandSettings } from '@/lib/firebase-store';
import { usePathname } from 'next/navigation';

export default function WhatsAppButton() {
  const { language } = useStore();
  const isRTL = language === 'ar';
  const [url, setUrl] = useState('');
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // Hide on admin page
  if (pathname?.startsWith('/admin')) return null;

  useEffect(() => {
    getBrandSettings().then(s => {
      if (s.whatsappUrl) setUrl(s.whatsappUrl);
      else if (s.whatsapp) setUrl(`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}`);
    });
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!url || !visible) return null;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      style={{
        position: 'fixed',
        bottom: 24,
        ...(isRTL ? { left: 20 } : { right: 20 }),
        zIndex: 500,
        width: 56, height: 56,
        borderRadius: '50%',
        background: '#25D366',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
        textDecoration: 'none',
      }}
    >
      <i className="fa-brands fa-whatsapp" style={{ fontSize: 28, color: '#fff' }} />
    </motion.a>
  );
}