'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '@/firebase/config';
import toast from 'react-hot-toast';

type AuthTab = 'login' | 'register' | 'phone';

export default function AccountPage() {
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmResult, setConfirmResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<any>(null);

  const { language } = useStore();
  const { user, userData, loginWithEmail, registerWithEmail, loginWithGoogle, loginWithPhone, logout, deleteAccount } = useAuth();
  const isRTL = language === 'ar';

  const setupRecaptcha = () => {
    if (!recaptchaVerifierRef.current && recaptchaRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
        callback: () => {},
      });
    }
    return recaptchaVerifierRef.current;
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error(isRTL ? 'أدخل رقم هاتف صحيح' : 'Enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const verifier = setupRecaptcha();
      const formatted = phone.startsWith('+') ? phone : `+2${phone}`;
      const result = await loginWithPhone(formatted, verifier);
      setConfirmResult(result);
      setOtpSent(true);
      toast.success(isRTL ? 'تم إرسال كود التحقق' : 'OTP sent successfully');
    } catch {
      toast.error(isRTL ? 'فشل إرسال الكود. تأكد من رقمك' : 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      toast.error(isRTL ? 'أدخل كود التحقق' : 'Enter the OTP code');
      return;
    }
    setLoading(true);
    try {
      await confirmResult.confirm(otp);
      toast.success(isRTL ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!');
    } catch {
      toast.error(isRTL ? 'كود التحقق غير صحيح' : 'Invalid OTP code');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try { await loginWithEmail(email, password); }
    catch {}
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast.error(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    setLoading(true);
    try { await registerWithEmail(name, email, password); }
    catch {}
    setLoading(false);
  };

  if (user) {
    return (
      <PageTransition>
        <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
          <Header onMenuOpen={() => setDrawer(true)} />
          <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />
          <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 20px 60px' }}>

            {/* Profile */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '3px solid var(--border)', background: 'var(--paper-soft)', position: 'relative' }}>
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="" fill className="object-cover" sizes="80px" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-user" style={{ fontSize: 32, color: 'var(--mid)' }} />
                  </div>
                )}
              </div>
              <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 22, color: 'var(--ink)', marginBottom: 4 }}>
                {user.displayName || user.phoneNumber || (isRTL ? 'مستخدم' : 'User')}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo' }}>
                {user.email || user.phoneNumber || ''}
              </p>
              {userData?.points !== undefined && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 20, padding: '6px 16px', marginTop: 12 }}>
                  <i className="fa-solid fa-star" style={{ fontSize: 13, color: '#eab308' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                    {userData.points} {isRTL ? 'نقطة' : 'Points'}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Quick Links */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[
                { href: '/cart', icon: 'fa-bag-shopping', labelAr: 'سلة التسوق', labelEn: 'Shopping Cart' },
                { href: '/account', icon: 'fa-heart', labelAr: 'المفضلة', labelEn: 'Wishlist' },
              ].map(item => (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', background: 'var(--paper-soft)',
                  border: '1.5px solid var(--border)', borderRadius: 12, textDecoration: 'none',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fa-solid ${item.icon}`} style={{ fontSize: 16, color: 'var(--paper)' }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                    {isRTL ? item.labelAr : item.labelEn}
                  </span>
                  <i className={`fa-solid ${isRTL ? 'fa-chevron-left' : 'fa-chevron-right'}`} style={{ fontSize: 12, color: 'var(--mid)', marginRight: 'auto', marginLeft: 'auto' }} />
                </Link>
              ))}
            </motion.div>

            {/* Actions */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={logout} className="btn-secondary" style={{ width: '100%' }}>
                <i className="fa-solid fa-arrow-right-from-bracket" />
                {isRTL ? 'تسجيل الخروج' : 'Logout'}
              </button>
              <button onClick={() => { if (confirm(isRTL ? 'هل أنت متأكد من حذف حسابك نهائياً؟' : 'Are you sure you want to delete your account?')) deleteAccount(); }}
                style={{ background: 'none', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px', color: '#ef4444', fontFamily: 'Cairo', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <i className="fa-solid fa-trash" style={{ fontSize: 13 }} />
                {isRTL ? 'حذف الحساب نهائياً' : 'Delete Account'}
              </button>
            </motion.div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Header onMenuOpen={() => setDrawer(true)} />
        <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />
        <div id="recaptcha-container" ref={recaptchaRef} />

        <div style={{ maxWidth: 420, margin: '0 auto', padding: '80px 20px 60px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 48, color: 'var(--ink)', lineHeight: 1 }}>زيّ</p>
              <p style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo', marginTop: 8 }}>
                {isRTL ? 'سجل دخولك للمتابعة' : 'Sign in to continue'}
              </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--paper-soft)', borderRadius: 12, padding: 4, marginBottom: 24, border: '1.5px solid var(--border)' }}>
              {[
                { key: 'login', labelAr: 'دخول', labelEn: 'Login' },
                { key: 'register', labelAr: 'حساب جديد', labelEn: 'Register' },
                { key: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone' },
              ].map(t => (
                <button key={t.key} onClick={() => { setTab(t.key as AuthTab); setOtpSent(false); }}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', background: tab === t.key ? 'var(--ink)' : 'transparent', color: tab === t.key ? 'var(--paper)' : 'var(--mid)', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo', fontWeight: 700, transition: 'all 0.2s' }}>
                  {isRTL ? t.labelAr : t.labelEn}
                </button>
              ))}
            </div>

            {/* Login */}
            {tab === 'login' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                  <div className="input-wrapper">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="example@email.com" />
                    <i className="fa-regular fa-envelope input-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                  <div className="input-wrapper">
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
                    <i className="fa-solid fa-lock input-icon" />
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogin} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                  {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-arrow-right-to-bracket" />}
                  {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                </motion.button>
              </motion.div>
            )}

            {/* Register */}
            {tab === 'register' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="input-group">
                  <label className="input-label">{isRTL ? 'الاسم الكامل' : 'Full Name'}</label>
                  <div className="input-wrapper">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder={isRTL ? 'اسمك الكامل' : 'Your full name'} />
                    <i className="fa-regular fa-user input-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                  <div className="input-wrapper">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="example@email.com" />
                    <i className="fa-regular fa-envelope input-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                  <div className="input-wrapper">
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
                    <i className="fa-solid fa-lock input-icon" />
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleRegister} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                  {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-user-plus" />}
                  {isRTL ? 'إنشاء حساب' : 'Create Account'}
                </motion.button>
              </motion.div>
            )}

            {/* Phone */}
            {tab === 'phone' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {!otpSent ? (
                  <>
                    <div className="input-group">
                      <label className="input-label">{isRTL ? 'رقم الهاتف' : 'Phone Number'}</label>
                      <div className="input-wrapper">
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder={isRTL ? '01xxxxxxxxx' : '+20xxxxxxxxxx'} />
                        <i className="fa-solid fa-phone input-icon" />
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo', marginTop: 4 }}>
                        {isRTL ? 'أدخل رقمك بصيغة دولية مثل +20123456789' : 'Enter number with country code e.g. +20123456789'}
                      </p>
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleSendOtp} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                      {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-paper-plane" />}
                      {isRTL ? 'إرسال كود التحقق' : 'Send OTP'}
                    </motion.button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo', textAlign: 'center', lineHeight: 1.7 }}>
                      {isRTL ? `تم إرسال الكود إلى ${phone}` : `Code sent to ${phone}`}
                    </p>
                    <div className="input-group">
                      <label className="input-label">{isRTL ? 'كود التحقق' : 'OTP Code'}</label>
                      <div className="input-wrapper">
                        <input type="number" value={otp} onChange={e => setOtp(e.target.value)} className="input-field" placeholder="------" style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: 20, fontWeight: 700 }} />
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleVerifyOtp} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                      {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-circle-check" />}
                      {isRTL ? 'تحقق من الكود' : 'Verify Code'}
                    </motion.button>
                    <button onClick={() => { setOtpSent(false); setOtp(''); }} style={{ background: 'none', border: 'none', color: 'var(--mid)', fontSize: 12, fontFamily: 'Cairo', cursor: 'pointer' }}>
                      {isRTL ? 'تغيير الرقم' : 'Change number'}
                    </button>
                  </>
                )}
              </motion.div>
            )}

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo' }}>
                {isRTL ? 'أو تابع بـ' : 'or continue with'}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Social Logins */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <motion.button whileTap={{ scale: 0.97 }} onClick={loginWithGoogle}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <i className="fa-brands fa-google" style={{ fontSize: 18, color: '#4285F4' }} />
                {isRTL ? 'تسجيل الدخول بـ Google' : 'Continue with Google'}
              </motion.button>

              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => toast.error(isRTL ? 'تسجيل الدخول بـ Apple متاح على iOS فقط' : 'Apple login is available on iOS only')}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid var(--border)', background: '#000', color: '#fff', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <i className="fa-brands fa-apple" style={{ fontSize: 20 }} />
                {isRTL ? 'تسجيل الدخول بـ Apple' : 'Continue with Apple'}
              </motion.button>
            </div>

            <p style={{ fontSize: 11, color: 'var(--mid)', textAlign: 'center', marginTop: 20, fontFamily: 'Cairo', lineHeight: 1.7 }}>
              {isRTL
                ? 'بتسجيل الدخول أنت توافق على شروطنا وسياسة الخصوصية'
                : 'By signing in you agree to our Terms and Privacy Policy'}
            </p>
          </motion.div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}