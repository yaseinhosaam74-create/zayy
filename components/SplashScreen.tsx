'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#111111',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            style={{
              fontFamily: 'Cairo, sans-serif',
              fontWeight: 900,
              fontSize: 88,
              color: '#ffffff',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            زيّ
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            style={{
              fontFamily: 'Cairo, sans-serif',
              fontWeight: 300,
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              marginTop: 12,
            }}
          >
            أناقة كلاسيكية
          </motion.p>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: 40,
              width: 48,
              height: 2,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
              style={{
                height: '100%',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: 2,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}