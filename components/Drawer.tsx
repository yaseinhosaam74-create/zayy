'use client';

import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

type DrawerProps = { isOpen: boolean; onClose: () => void };

const nav = [
  { href: '/', ar: 'الرئيسية', en: 'Home', icon: 'fa-house' },
  { href: '/men', ar: 'رجال', en: "Men's", icon: 'fa-person' },
  { href: '/women', ar: 'نساء', en: "Women's", icon: 'fa-person-dress' },
  { href: '/offers', ar: 'العروض', en: 'Offers', icon: 'fa-tag' },
  { href: '/about', ar: 'من نحن', en: 'About', icon: 'fa-circle-info' },
  { href: '/contact', ar: 'تواصل معنا', en: 'Contact', icon: 'fa-envelope' },
];

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const { language, toggleLanguage, theme, toggleTheme } = useStore();
  const { user, logout } = useAuth();
  const isRTL = language === 'ar';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(3px)',
            }}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: isRTL ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '100%' : '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              ...(isRTL ? { right: 0 } : { left: 0 }),
              width: 300,
              zIndex: 101,
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isRTL ? '-4px 0 24px rgba(0,0,0,0.1)' : '4px 0 24px rgba(0,0,0,0.1)',
            }}
          >

            {/* Top bar */}
            <div style={{ height: 60, borderBottom: '1px solid #e8e8e4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
              <Link href="/" onClick={onClose} style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, fontSize: 24, color: '#1a1a1a', textDecoration: 'none' }}>
                زيّ
              </Link>
              <button
                onClick={onClose}
                style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: '#f8f8f6', border: 'none', cursor: 'pointer', color: '#767676' }}
              >
                <i className="fa-solid fa-xmark" style={{ fontSize: 16 }} />
              </button>
            </div>

            {/* User Card */}
            {user && (
              <div style={{ margin: '12px 12px 0', padding: '12px', background: '#f8f8f6', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#1a1a1a', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                }}>
                  {user.photoURL
                    ? <img src={user.photoURL} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <i className="fa-regular fa-user" style={{ color: '#fff', fontSize: 14 }} />
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.displayName || (isRTL ? 'مرحباً' : 'Hello')}
                  </p>
                  <p style={{ fontSize: 11, color: '#767676', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
              {nav.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.035 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 14px',
                      borderRadius: 10,
                      marginBottom: 2,
                      textDecoration: 'none',
                      color: '#1a1a1a',
                      fontSize: 14,
                      fontWeight: 600,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8f8f6'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`fa-solid ${item.icon}`} style={{ fontSize: 13, color: '#767676' }} />
                    </div>
                    <span style={{ flex: 1 }}>{isRTL ? item.ar : item.en}</span>
                    <i className={`fa-solid ${isRTL ? 'fa-chevron-left' : 'fa-chevron-right'}`} style={{ fontSize: 10, color: '#c8c8c4' }} />
                  </Link>
                </motion.div>
              ))}

              {/* Divider */}
              <div style={{ height: 1, background: '#e8e8e4', margin: '8px 8px' }} />

              {/* Wishlist & Cart shortcuts */}
              <Link href="/account" onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, marginBottom: 2, textDecoration: 'none', color: '#1a1a1a', fontSize: 14, fontWeight: 600 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fa-regular fa-heart" style={{ fontSize: 13, color: '#767676' }} />
                </div>
                <span style={{ flex: 1 }}>{isRTL ? 'المفضلة' : 'Wishlist'}</span>
                <i className={`fa-solid ${isRTL ? 'fa-chevron-left' : 'fa-chevron-right'}`} style={{ fontSize: 10, color: '#c8c8c4' }} />
              </Link>

              <Link href="/cart" onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, marginBottom: 2, textDecoration: 'none', color: '#1a1a1a', fontSize: 14, fontWeight: 600 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fa-solid fa-bag-shopping" style={{ fontSize: 13, color: '#767676' }} />
                </div>
                <span style={{ flex: 1 }}>{isRTL ? 'سلة التسوق' : 'Shopping Cart'}</span>
                <i className={`fa-solid ${isRTL ? 'fa-chevron-left' : 'fa-chevron-right'}`} style={{ fontSize: 10, color: '#c8c8c4' }} />
              </Link>

              {/* Divider */}
              <div style={{ height: 1, background: '#e8e8e4', margin: '8px 8px' }} />

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                  borderRadius: 10, marginBottom: 2, width: '100%', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#1a1a1a', fontSize: 14, fontWeight: 600,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fa-solid fa-language" style={{ fontSize: 14, color: '#767676' }} />
                </div>
                <span style={{ flex: 1 }}>{isRTL ? 'English' : 'العربية'}</span>
                <span style={{ fontSize: 11, color: '#767676', background: '#f0f0ee', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                  {isRTL ? 'EN' : 'ع'}
                </span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                  borderRadius: 10, marginBottom: 2, width: '100%', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#1a1a1a', fontSize: 14, fontWeight: 600,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} style={{ fontSize: 14, color: '#767676' }} />
                </div>
                <span style={{ flex: 1 }}>{isRTL ? (theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح') : (theme === 'light' ? 'Dark Mode' : 'Light Mode')}</span>
              </button>

            </nav>

            {/* Bottom */}
            <div style={{ padding: '12px', borderTop: '1px solid #e8e8e4', flexShrink: 0 }}>
              {user ? (
                <button
                  onClick={() => { logout(); onClose(); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', borderRadius: 10, background: '#fff5f5',
                    border: '1px solid #fecaca', cursor: 'pointer', color: '#ef4444',
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 14 }} />
                  {isRTL ? 'تسجيل الخروج' : 'Logout'}
                </button>
              ) : (
                <Link
                  href="/account"
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px', borderRadius: 10, background: '#1a1a1a', color: '#fff',
                    fontWeight: 700, fontSize: 13, textDecoration: 'none',
                  }}
                >
                  <i className="fa-regular fa-user" style={{ fontSize: 14 }} />
                  {isRTL ? 'تسجيل الدخول / إنشاء حساب' : 'Login / Register'}
                </Link>
              )}
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}