'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store/useStore';
import { getAllProducts, type Product } from '@/lib/firebase-store';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'profile' | 'wishlist' | 'orders';

export default function AccountPage() {
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState<Tab>('profile');
  const [isLogin, setIsLogin] = useState(true);
  const [showDel, setShowDel] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' });
  const [wishProducts, setWishProducts] = useState<Product[]>([]);

  const { language, wishlist } = useStore();
  const isRTL = language === 'ar';
  const {
    user,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    deleteAccount,
  } = useAuth();

  useEffect(() => {
    if (wishlist.length > 0) {
      getAllProducts().then(all => {
        setWishProducts(all.filter(p => wishlist.includes(p.id)));
      });
    } else {
      setWishProducts([]);
    }
  }, [wishlist]);

  const tabs: { id: Tab; ar: string; en: string; icon: string }[] = [
    { id: 'profile', ar: 'الملف الشخصي', en: 'Profile', icon: 'fa-user' },
    { id: 'wishlist', ar: 'المفضلة', en: 'Wishlist', icon: 'fa-heart' },
    { id: 'orders', ar: 'طلباتي', en: 'My Orders', icon: 'fa-box' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Header onMenuOpen={() => setDrawer(true)} />
      <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px 80px', paddingTop: 54 }}>

        {!user ? (
          <div className="page-enter">
            <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--paper-soft)', border: '1.5px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <i className="fa-regular fa-user" style={{ fontSize: 26, color: 'var(--mid)' }} />
              </div>
              <h1 style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 900, fontSize: 26, color: 'var(--ink)', marginBottom: 6 }}>
                {isLogin ? (isRTL ? 'تسجيل الدخول' : 'Welcome Back') : (isRTL ? 'إنشاء حساب جديد' : 'Create Account')}
              </h1>
              <p style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo, sans-serif' }}>
                {isLogin
                  ? (isRTL ? 'سجل دخولك للوصول لحسابك' : 'Sign in to access your account')
                  : (isRTL ? 'أنشئ حسابك الآن مجاناً' : 'Create your free account now')}
              </p>
            </div>

            <button
              onClick={loginWithGoogle}
              className="btn-secondary"
              style={{ width: '100%', height: 50, marginBottom: 20, fontSize: 14, gap: 10 }}
            >
              <i className="fa-brands fa-google" style={{ fontSize: 17, color: '#4285F4' }} />
              {isRTL ? 'المتابعة بحساب Google' : 'Continue with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo, sans-serif' }}>
                {isRTL ? 'أو' : 'or'}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {isLogin ? (
              <form
                onSubmit={async e => { e.preventDefault(); try { await loginWithEmail(loginForm.email, loginForm.password); } catch {} }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div className="input-group">
                  <label className="input-label">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                  <div className="input-wrapper">
                    <input type="email" required value={loginForm.email}
                      onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="input-field" placeholder={isRTL ? 'بريدك الإلكتروني' : 'your@email.com'} />
                    <i className="fa-regular fa-envelope input-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                  <div className="input-wrapper">
                    <input type="password" required value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="input-field" placeholder="••••••••" />
                    <i className="fa-solid fa-lock input-icon" />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
                  <i className="fa-solid fa-right-to-bracket" style={{ fontSize: 14 }} />
                  {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form
                onSubmit={async e => { e.preventDefault(); try { await registerWithEmail(regForm.name, regForm.email, regForm.password); } catch {} }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div className="input-group">
                  <label className="input-label">{isRTL ? 'الاسم الكامل' : 'Full Name'}</label>
                  <div className="input-wrapper">
                    <input type="text" required value={regForm.name}
                      onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                      className="input-field" placeholder={isRTL ? 'اسمك الكامل' : 'Your full name'} />
                    <i className="fa-regular fa-user input-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                  <div className="input-wrapper">
                    <input type="email" required value={regForm.email}
                      onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                      className="input-field" placeholder={isRTL ? 'بريدك الإلكتروني' : 'your@email.com'} />
                    <i className="fa-regular fa-envelope input-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                  <div className="input-wrapper">
                    <input type="password" required value={regForm.password}
                      onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                      className="input-field" placeholder="••••••••" />
                    <i className="fa-solid fa-lock input-icon" />
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
                  <i className="fa-solid fa-user-plus" style={{ fontSize: 14 }} />
                  {isRTL ? 'إنشاء الحساب' : 'Create Account'}
                </button>
              </form>
            )}

            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{ width: '100%', textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo, sans-serif', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            >
              {isLogin
                ? (isRTL ? 'ليس لديك حساب؟ سجل الآن' : "Don't have an account? Register")
                : (isRTL ? 'لديك حساب؟ سجل الدخول' : 'Already have an account? Sign In')}
            </button>
          </div>

        ) : (
          <div className="page-enter">

            {/* User Banner */}
            <div style={{
              margin: '20px 0', padding: '16px',
              background: 'var(--paper-soft)', border: '1.5px solid var(--border)',
              borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--ink)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                fontFamily: 'Cairo', fontWeight: 900, fontSize: 18, color: 'var(--paper)',
              }}>
                {user.photoURL
                  ? <img src={user.photoURL} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (user.displayName?.[0]?.toUpperCase() || <i className="fa-regular fa-user" style={{ fontSize: 18 }} />)
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', fontFamily: 'Cairo', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName || (isRTL ? 'مرحباً' : 'Hello')}
                </p>
                <p style={{ fontSize: 12, color: 'var(--mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Cairo' }}>
                  {user.email}
                </p>
              </div>
              <button onClick={logout} className="btn-danger" style={{ padding: '8px 14px', fontSize: 12, flexShrink: 0 }}>
                <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 12 }} />
                {isRTL ? 'خروج' : 'Logout'}
              </button>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', background: 'var(--paper-soft)',
              borderRadius: 12, padding: 4, marginBottom: 24,
              border: '1.5px solid var(--border)',
            }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, padding: '10px 8px', borderRadius: 9, fontSize: 12,
                    fontWeight: 700, fontFamily: 'Cairo', cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: tab === t.id ? 'var(--ink)' : 'transparent',
                    color: tab === t.id ? 'var(--paper)' : 'var(--mid)',
                    border: 'none',
                  }}
                >
                  <i className={`fa-solid ${t.icon}`} style={{ fontSize: 12 }} />
                  {isRTL ? t.ar : t.en}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {tab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { icon: 'fa-user', labelAr: 'الاسم', labelEn: 'Name', val: user.displayName || '—' },
                    { icon: 'fa-envelope', labelAr: 'البريد الإلكتروني', labelEn: 'Email', val: user.email || '—' },
                  ].map(item => (
                    <div key={item.labelEn} className="info-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'var(--paper)', border: '1.5px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <i className={`fa-solid ${item.icon}`} style={{ fontSize: 15, color: 'var(--ink)' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: 'var(--mid)', marginBottom: 2, fontFamily: 'Cairo' }}>
                          {isRTL ? item.labelAr : item.labelEn}
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                          {item.val}
                        </p>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowDel(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 13, fontWeight: 600, fontFamily: 'Cairo', padding: '8px 0' }}
                  >
                    <i className="fa-solid fa-trash" style={{ fontSize: 13 }} />
                    {isRTL ? 'حذف الحساب نهائياً' : 'Delete Account Permanently'}
                  </button>
                </motion.div>
              )}

              {tab === 'wishlist' && (
                <motion.div key="wishlist" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {wishProducts.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 14 }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--paper-soft)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-regular fa-heart" style={{ fontSize: 24, color: 'var(--mid)' }} />
                      </div>
                      <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                        {isRTL ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
                      </p>
                    </div>
                  ) : (
                    <div className="product-grid">
                      {wishProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 14 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--paper-soft)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-box" style={{ fontSize: 24, color: 'var(--mid)' }} />
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                      {isRTL ? 'لا توجد طلبات بعد' : 'No orders yet'}
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            <AnimatePresence>
              {showDel && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                  <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
                    style={{ width: '100%', maxWidth: 360, background: 'var(--paper)', borderRadius: 16, padding: 28 }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 22, color: '#ef4444' }} />
                    </div>
                    <h3 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 18, color: 'var(--ink)', textAlign: 'center', marginBottom: 10 }}>
                      {isRTL ? 'حذف الحساب' : 'Delete Account'}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--mid)', textAlign: 'center', lineHeight: 1.7, marginBottom: 24, fontFamily: 'Cairo' }}>
                      {isRTL ? 'هل أنت متأكد؟ سيتم حذف جميع بياناتك نهائياً.' : 'Are you sure? All your data will be permanently deleted.'}
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={async () => { try { await deleteAccount(); } catch {} setShowDel(false); }} className="btn-danger" style={{ flex: 1 }}>
                        {isRTL ? 'نعم، احذف' : 'Yes, Delete'}
                      </button>
                      <button onClick={() => setShowDel(false)} className="btn-secondary" style={{ flex: 1 }}>
                        {isRTL ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}