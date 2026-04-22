'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getBrandSettings } from '@/lib/firebase-store';
import { useStore } from '@/store/useStore';
import { usePathname } from 'next/navigation';

export default function MaintenanceCheck() {
  const [maintenance, setMaintenance] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const { language } = useStore();
  const isRTL = language === 'ar';
  const pathname = usePathname();

  // Don't block admin page
  if (pathname?.startsWith('/admin')) return null;

  useEffect(() => {
    getBrandSettings().then(s => {
      setSettings(s);
      setMaintenance(!!(s as any).maintenanceMode);
    });
  }, []);

  if (!maintenance || !settings) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: '#111',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 32, textAlign: 'center',
        }}
      >
        {/* Background Image */}
        {settings.maintenanceImageUrl && (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
            <Image src={settings.maintenanceImageUrl} alt="" fill className="object-cover" sizes="100vw" />
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 420 }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 64, color: '#fff', lineHeight: 1, marginBottom: 8 }}
          >
            زيّ
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.2)', margin: '0 auto 24px' }}
          />

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 28, color: '#fff', marginBottom: 16, lineHeight: 1.3 }}
          >
            {isRTL
              ? (settings.maintenanceTitleAr || 'نحن نعمل على تحسين موقعنا')
              : (settings.maintenanceTitleEn || "We're improving our site")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontFamily: 'Cairo', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 32 }}
          >
            {isRTL
              ? (settings.maintenanceTextAr || 'سنعود قريباً بتجربة أفضل. شكراً لصبركم')
              : (settings.maintenanceTextEn || "We'll be back soon with a better experience. Thank you for your patience")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center' }}
          >
            {settings.maintenanceInstagram && (
              <a href={settings.maintenanceInstagram} target="_blank" rel="noopener noreferrer"
                style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, textDecoration: 'none' }}>
                <i className="fa-brands fa-instagram" />
              </a>
            )}
            {settings.maintenanceTiktok && (
              <a href={settings.maintenanceTiktok} target="_blank" rel="noopener noreferrer"
                style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, textDecoration: 'none' }}>
                <i className="fa-brands fa-tiktok" />
              </a>
            )}
            {settings.maintenanceWhatsapp && (
              <a href={settings.maintenanceWhatsapp} target="_blank" rel="noopener noreferrer"
                style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, textDecoration: 'none' }}>
                <i className="fa-brands fa-whatsapp" />
              </a>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}