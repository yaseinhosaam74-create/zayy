'use client';

import { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { getAllProducts, getUserOrders, type Order } from '@/lib/firebase-store';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import type { ConfirmationResult } from 'firebase/auth';

type AccountTab = 'login' | 'register' | 'phone';
type ProfileTab = 'orders' | 'wishlist' | 'coins';

const STATUS_CONFIG: Record<string, { labelAr: string; labelEn: string; color: string; icon: string }> = {
  pending: { labelAr: 'قيد المراجعة', labelEn: 'Pending', color: '#eab308', icon: 'fa-clock' },
  confirmed: { labelAr: 'تم التأكيد', labelEn: 'Confirmed', color: '#3b82f6', icon: 'fa-circle-check' },
  shipped: { labelAr: 'جاري الشحن', labelEn: 'Shipped', color: '#8b5cf6', icon: 'fa-truck-fast' },
  delivered: { labelAr: 'تم التوصيل', labelEn: 'Delivered', color: '#22c55e', icon: 'fa-house-circle-check' },
  cancelled: { labelAr: 'ملغي', labelEn: 'Cancelled', color: '#ef4444', icon: 'fa-xmark' },
};

export default function AccountPage() {
  const [drawer, setDrawer] = useState(false);
  const [authTab, setAuthTab] = useState<AccountTab>('login');
  const [profileTab, setProfileTab] = useState<ProfileTab>('orders');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { language, wishlist } = useStore();
  const { user, userData, loginWithEmail, registerWithEmail, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp, logout, deleteAccount } = useAuth();
  const isRTL = language === 'ar';
  const router = useRouter();

  useEffect(() => {
    if (user) {
      getUserOrders(user.uid).then(setOrders);
      loadWishlistProducts();
    }
  }, [user, wishlist]);

  const loadWishlistProducts = async () => {
    if (wishlist.length === 0) { setWishlistProducts([]); return; }
    try {
      const all = await getAllProducts();
      setWishlistProducts(all.filter(p => wishlist.includes(p.id)));
    } catch {}
  };

  const handleLogin = async () => {
    if (!email || !password) { toast.error(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'); return; }
    setLoading(true);
    try { await loginWithEmail(email, password); }
    catch { toast.error(isRTL ? 'بيانات خاطئة' : 'Invalid credentials'); }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { toast.error(isRTL ? 'يرجى ملء جميع الحقول' : 'Fill all fields'); return; }
    if (password.length < 6) { toast.error(isRTL ? 'كلمة المرور 6 أحرف على الأقل' : 'Password min 6 chars'); return; }
    setLoading(true);
    try { await registerWithEmail(name, email, password); }
    catch { toast.error(isRTL ? 'فشل إنشاء الحساب' : 'Registration failed'); }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!phone) { toast.error(isRTL ? 'أدخل رقم الهاتف' : 'Enter phone number'); return; }
    setLoading(true);
    try {
      const result = await sendPhoneOtp(phone);
      setConfirmation(result);
      setOtpSent(true);
      toast.success(isRTL ? 'تم إرسال الكود' : 'Code sent');
    } catch {
      toast.error(isRTL ? 'فشل إرسال الكود. تأكد من الرقم' : 'Failed to send code');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmation) return;
    setLoading(true);
    try { await verifyPhoneOtp(confirmation, otp); }
    catch { toast.error(isRTL ? 'كود غير صحيح' : 'Invalid code'); }
    setLoading(false);
  };

  const coinValue = (userData?.coins || 0) * 5;

  // ── LOGGED IN ──
  if (user) {
    return (
      <PageTransition>
        <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
          <Header onMenuOpen={() => setDrawer(true)} />
          <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

          <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 20px 80px' }}>

            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, padding: '20px', background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: 'var(--border)', flexShrink: 0, position: 'relative' }}>
                {user.photoURL
                  ? <Image src={user.photoURL} alt="" fill className="object-cover" sizes="64px" />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
                    <i className="fa-solid fa-user" style={{ fontSize: 26, color: '#fff' }} />
                  </div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 18, color: 'var(--ink)', marginBottom: 2 }}>
                  {user.displayName || user.phoneNumber || (isRTL ? 'مستخدم' : 'User')}
                </h2>
                <p style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo' }}>
                  {user.email || user.phoneNumber}
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '8px 14px', background: 'var(--paper)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 15 }}>🪙</span>
                  <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--ink)', fontFamily: 'Cairo' }}>{userData?.coins || 0}</span>
                </div>
                <p style={{ fontSize: 10, color: 'var(--mid)', fontFamily: 'Cairo' }}>ZaayCoin</p>
              </div>
            </motion.div>

            {/* Coins Value Banner */}
            {(userData?.coins || 0) > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Cairo', marginBottom: 3 }}>
                    {isRTL ? 'رصيدك من ZaayCoin' : 'Your ZaayCoin Balance'}
                  </p>
                  <p style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: 'Cairo' }}>
                    {userData?.coins} {isRTL ? 'كوين' : 'coins'} = {coinValue} {isRTL ? 'ج.م' : 'EGP'}
                  </p>
                </div>
                <span style={{ fontSize: 28 }}>🪙</span>
              </motion.div>
            )}

            {/* Profile Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--paper-soft)', borderRadius: 12, padding: 4, marginBottom: 20, border: '1.5px solid var(--border)' }}>
              {[
                { key: 'orders', labelAr: 'طلباتي', labelEn: 'My Orders', icon: 'fa-bag-shopping' },
                { key: 'wishlist', labelAr: 'المفضلة', labelEn: 'Wishlist', icon: 'fa-heart' },
                { key: 'coins', labelAr: 'كويني', labelEn: 'My Coins', icon: '🪙' },
              ].map(t => (
                <button key={t.key} onClick={() => setProfileTab(t.key as ProfileTab)}
                  style={{ flex: 1, padding: '9px 4px', borderRadius: 8, border: 'none', background: profileTab === t.key ? 'var(--ink)' : 'transparent', color: profileTab === t.key ? 'var(--paper)' : 'var(--mid)', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.2s' }}>
                  {typeof t.icon === 'string' && t.icon.length <= 2
                    ? <span style={{ fontSize: 14 }}>{t.icon}</span>
                    : <i className={`fa-solid ${t.icon}`} style={{ fontSize: 11 }} />}
                  {isRTL ? t.labelAr : t.labelEn}
                </button>
              ))}
            </div>

            {/* ── ORDERS TAB ── */}
            {profileTab === 'orders' && (
              <AnimatePresence mode="wait">
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                      <i className="fa-solid fa-bag-shopping" style={{ fontSize: 40, color: 'var(--border)', display: 'block', marginBottom: 12 }} />
                      <p style={{ fontFamily: 'Cairo', color: 'var(--mid)', fontSize: 14 }}>
                        {isRTL ? 'لا توجد طلبات حتى الآن' : 'No orders yet'}
                      </p>
                      <Link href="/" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
                        {isRTL ? 'تسوق الآن' : 'Shop Now'}
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {orders.map(order => {
                        const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                        return (
                          <div key={order.id} style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 14, padding: 16, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                              <div>
                                <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo', marginBottom: 3 }}>
                                  #{order.id.slice(-8).toUpperCase()}
                                </p>
                                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                                  {order.total} {isRTL ? 'ج.م' : 'EGP'}
                                </p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, background: `${statusCfg.color}15` }}>
                                <i className={`fa-solid ${statusCfg.icon}`} style={{ fontSize: 11, color: statusCfg.color }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: statusCfg.color, fontFamily: 'Cairo' }}>
                                  {isRTL ? statusCfg.labelAr : statusCfg.labelEn}
                                </span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                              {['pending', 'confirmed', 'shipped', 'delivered'].map((s, i) => {
                                const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
                                const currentIdx = statuses.indexOf(order.status);
                                const isActive = i <= currentIdx && order.status !== 'cancelled';
                                return (
                                  <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: isActive ? STATUS_CONFIG[s].color : 'var(--border)', transition: 'background 0.3s' }} />
                                );
                              })}
                            </div>

                            {/* Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {order.items?.slice(0, 3).map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 40, height: 48, borderRadius: 6, overflow: 'hidden', background: 'var(--border)', flexShrink: 0, position: 'relative' }}>
                                    {item.image && <Image src={item.image} alt="" fill className="object-cover" sizes="40px" />}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                                      {isRTL ? item.nameAr : item.nameEn}
                                    </p>
                                    <p style={{ fontSize: 10, color: 'var(--mid)', fontFamily: 'Cairo' }}>
                                      {item.size} × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {order.items?.length > 3 && (
                                <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo' }}>
                                  +{order.items.length - 3} {isRTL ? 'منتج آخر' : 'more items'}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {/* ── WISHLIST TAB ── */}
            {profileTab === 'wishlist' && (
              <AnimatePresence mode="wait">
                <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {wishlistProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                      <i className="fa-regular fa-heart" style={{ fontSize: 40, color: 'var(--border)', display: 'block', marginBottom: 12 }} />
                      <p style={{ fontFamily: 'Cairo', color: 'var(--mid)', fontSize: 14 }}>
                        {isRTL ? 'لا توجد منتجات مفضلة' : 'No wishlist items'}
                      </p>
                      <Link href="/" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
                        {isRTL ? 'تصفح المنتجات' : 'Browse Products'}
                      </Link>
                    </div>
                  ) : (
                    <div className="product-grid">
                      {wishlistProducts.map(p => (
                        <Link key={p.id} href={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                            <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--border)' }}>
                              {p.images?.[0] && <Image src={p.images[0]} alt="" fill className="object-cover" sizes="50vw" />}
                            </div>
                            <div style={{ padding: '10px 12px 12px' }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo', marginBottom: 4 }}>
                                {isRTL ? p.nameAr : p.nameEn}
                              </p>
                              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                                {p.price} {isRTL ? 'ج.م' : 'EGP'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {/* ── COINS TAB ── */}
            {profileTab === 'coins' && (
              <AnimatePresence mode="wait">
                <motion.div key="coins" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Balance Card */}
                  <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <span style={{ fontSize: 48, display: 'block', marginBottom: 8 }}>🪙</span>
                    <p style={{ fontSize: 36, fontWeight: 900, color: '#fff', fontFamily: 'Cairo', marginBottom: 6 }}>
                      {userData?.coins || 0}
                    </p>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: 'Cairo', marginBottom: 16 }}>
                      ZaayCoin
                    </p>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', display: 'inline-block' }}>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'Cairo', fontWeight: 700 }}>
                        = {coinValue} {isRTL ? 'جنيه مصري' : 'EGP'}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 14, padding: 16 }}>
                    <p style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>
                      {isRTL ? 'ما هي ZaayCoin؟' : 'What is ZaayCoin?'}
                    </p>
                    <p style={{ fontFamily: 'Cairo', fontSize: 13, color: 'var(--mid)', lineHeight: 1.8 }}>
                      {isRTL
                        ? 'ZaayCoin هي عملة المتجر الخاصة بنا. كل كوين يساوي 5 ج.م يمكن استخدامها في مشترياتك القادمة.'
                        : 'ZaayCoin is our store currency. Each coin equals 5 EGP that can be used in your next purchase.'}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Account Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <button onClick={logout}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <i className="fa-solid fa-arrow-right-from-bracket" />
                {isRTL ? 'تسجيل الخروج' : 'Logout'}
              </button>
              <button onClick={() => setShowDeleteConfirm(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, border: '1.5px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontFamily: 'Cairo', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <i className="fa-solid fa-trash" />
                {isRTL ? 'حذف الحساب' : 'Delete Account'}
              </button>
            </div>
          </div>

          {/* Delete Confirm Dialog */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
                  style={{ background: 'var(--paper)', borderRadius: 20, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 24, color: '#ef4444' }} />
                  </div>
                  <h3 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 18, color: 'var(--ink)', marginBottom: 10 }}>
                    {isRTL ? 'حذف الحساب نهائياً' : 'Delete Account'}
                  </h3>
                  <p style={{ fontFamily: 'Cairo', fontSize: 13, color: 'var(--mid)', lineHeight: 1.7, marginBottom: 24 }}>
                    {isRTL
                      ? 'هل أنت متأكد؟ سيتم حذف حسابك وجميع بياناتك بشكل نهائي ولا يمكن التراجع.'
                      : "Are you sure? Your account and all data will be permanently deleted and can't be undone."}
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowDeleteConfirm(false)}
                      style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button onClick={() => { deleteAccount(); setShowDeleteConfirm(false); }}
                      style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#ef4444', color: '#fff', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      {isRTL ? 'نعم، احذف' : 'Delete'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <Footer />
        </div>
      </PageTransition>
    );
  }

  // ── NOT LOGGED IN ──
  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Header onMenuOpen={() => setDrawer(true)} />
        <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

        {/* reCAPTCHA invisible container */}
        <div id="recaptcha-container" style={{ position: 'fixed', bottom: 0, left: 0, zIndex: -1, opacity: 0 }} />

        <div style={{ maxWidth: 400, margin: '0 auto', padding: '72px 20px 60px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 52, color: 'var(--ink)', lineHeight: 1, marginBottom: 8 }}>زيّ</p>
              <p style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo' }}>
                {isRTL ? 'سجل دخولك للمتابعة' : 'Sign in to continue'}
              </p>
            </div>

            {/* Auth Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--paper-soft)', borderRadius: 12, padding: 4, marginBottom: 22, border: '1.5px solid var(--border)' }}>
              {[
                { key: 'login', labelAr: 'دخول', labelEn: 'Login' },
                { key: 'register', labelAr: 'حساب جديد', labelEn: 'Register' },
                { key: 'phone', labelAr: 'هاتف', labelEn: 'Phone' },
              ].map(t => (
                <button key={t.key} onClick={() => { setAuthTab(t.key as AccountTab); setOtpSent(false); setOtp(''); }}
                  style={{ flex: 1, padding: '9px 4px', borderRadius: 8, border: 'none', background: authTab === t.key ? 'var(--ink)' : 'transparent', color: authTab === t.key ? 'var(--paper)' : 'var(--mid)', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo', fontWeight: 700, transition: 'all 0.2s' }}>
                  {isRTL ? t.labelAr : t.labelEn}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Login */}
              {authTab === 'login' && (
                <motion.div key="login" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', display: 'block', marginBottom: 6 }}>
                      {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--paper-soft)', color: 'var(--ink)', fontSize: 14, fontFamily: 'Cairo', boxSizing: 'border-box', outline: 'none' }} />
                      <i className="fa-regular fa-envelope" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineEnd: 14, color: 'var(--mid)', fontSize: 14 }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', display: 'block', marginBottom: 6 }}>
                      {isRTL ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--paper-soft)', color: 'var(--ink)', fontSize: 14, fontFamily: 'Cairo', boxSizing: 'border-box', outline: 'none' }} />
                      <i className="fa-solid fa-lock" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineEnd: 14, color: 'var(--mid)', fontSize: 14 }} />
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogin} disabled={loading}
                    style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-arrow-right-to-bracket" />}
                    {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                  </motion.button>
                </motion.div>
              )}

              {/* Register */}
              {authTab === 'register' && (
                <motion.div key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: isRTL ? 'الاسم الكامل' : 'Full Name', value: name, set: setName, type: 'text', icon: 'fa-user', placeholder: isRTL ? 'اسمك الكامل' : 'Your name' },
                    { label: isRTL ? 'البريد الإلكتروني' : 'Email', value: email, set: setEmail, type: 'email', icon: 'fa-envelope', placeholder: 'example@email.com' },
                    { label: isRTL ? 'كلمة المرور' : 'Password', value: password, set: setPassword, type: 'password', icon: 'fa-lock', placeholder: '••••••••' },
                  ].map(f => (
                    <div key={f.label}>
                      <label style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', display: 'block', marginBottom: 6 }}>{f.label}</label>
                      <div style={{ position: 'relative' }}>
                        <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                          style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--paper-soft)', color: 'var(--ink)', fontSize: 14, fontFamily: 'Cairo', boxSizing: 'border-box', outline: 'none' }} />
                        <i className={`fa-${f.type === 'password' ? 'solid' : 'regular'} ${f.icon}`} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineEnd: 14, color: 'var(--mid)', fontSize: 14 }} />
                      </div>
                    </div>
                  ))}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleRegister} disabled={loading}
                    style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-user-plus" />}
                    {isRTL ? 'إنشاء حساب' : 'Create Account'}
                  </motion.button>
                </motion.div>
              )}

              {/* Phone */}
              {authTab === 'phone' && (
                <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {!otpSent ? (
                    <>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', display: 'block', marginBottom: 6 }}>
                          {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                            placeholder={isRTL ? 'مثال: 01xxxxxxxxx' : '+20xxxxxxxxxx'}
                            style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--paper-soft)', color: 'var(--ink)', fontSize: 14, fontFamily: 'Cairo', boxSizing: 'border-box', outline: 'none' }} />
                          <i className="fa-solid fa-phone" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineEnd: 14, color: 'var(--mid)', fontSize: 14 }} />
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo', marginTop: 6 }}>
                          {isRTL ? 'أدخل رقمك مع كود الدولة مثل +20123456789' : 'Enter with country code e.g. +20123456789'}
                        </p>
                      </div>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={handleSendOtp} disabled={loading}
                        style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-paper-plane" />}
                        {isRTL ? 'إرسال كود التحقق' : 'Send OTP'}
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo', textAlign: 'center' }}>
                        {isRTL ? `تم إرسال الكود إلى ${phone}` : `Code sent to ${phone}`}
                      </p>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', display: 'block', marginBottom: 6 }}>
                          {isRTL ? 'كود التحقق' : 'Verification Code'}
                        </label>
                        <input type="number" value={otp} onChange={e => setOtp(e.target.value)}
                          placeholder="------"
                          style={{ width: '100%', padding: '14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--paper-soft)', color: 'var(--ink)', fontSize: 22, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.3em', fontWeight: 700, boxSizing: 'border-box', outline: 'none' }} />
                      </div>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={handleVerifyOtp} disabled={loading}
                        style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-circle-check" />}
                        {isRTL ? 'تحقق من الكود' : 'Verify Code'}
                      </motion.button>
                      <button onClick={() => { setOtpSent(false); setOtp(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--mid)', fontSize: 12, fontFamily: 'Cairo', cursor: 'pointer', padding: '4px 0' }}>
                        {isRTL ? '← تغيير الرقم' : '← Change number'}
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo' }}>
                {isRTL ? 'أو تابع بـ' : 'or continue with'}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={loginWithGoogle}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <i className="fa-brands fa-google" style={{ fontSize: 18, color: '#4285F4' }} />
                {isRTL ? 'تسجيل الدخول بـ Google' : 'Continue with Google'}
              </motion.button>

              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => toast.error(isRTL ? 'تسجيل الدخول بـ Apple متاح على أجهزة Apple فقط' : 'Apple login available on Apple devices only')}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid var(--border)', background: '#000', color: '#fff', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <i className="fa-brands fa-apple" style={{ fontSize: 20 }} />
                {isRTL ? 'تسجيل الدخول بـ Apple' : 'Continue with Apple'}
              </motion.button>
            </div>

            <p style={{ fontSize: 11, color: 'var(--mid)', textAlign: 'center', marginTop: 20, fontFamily: 'Cairo', lineHeight: 1.8 }}>
              {isRTL
                ? 'بتسجيل الدخول توافق على شروطنا وسياسة الخصوصية'
                : 'By signing in you agree to our Terms and Privacy Policy'}
            </p>
          </motion.div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}