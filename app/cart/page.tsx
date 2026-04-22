'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type CheckoutStep = 'cart' | 'info' | 'confirm';

export default function CartPage() {
  const [drawer, setDrawer] = useState(false);
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [guestInfo, setGuestInfo] = useState({
    name: '', phone: '', address: '', notes: '',
  });
  const { language, cart, removeFromCart, updateQuantity, clearCart } = useStore();
  const { user } = useAuth();
  const isRTL = language === 'ar';

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setStep('info');
  };

  const handleConfirm = () => {
    if (!guestInfo.name || !guestInfo.phone) {
      toast.error(isRTL ? 'يرجى ملء الاسم ورقم الهاتف' : 'Please fill in name and phone');
      return;
    }
    setStep('confirm');
  };

  const handlePlaceOrder = () => {
    // Save order to Firestore
    toast.success(isRTL ? 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً' : 'Order placed! We will contact you soon');
    clearCart();
    setStep('cart');
    setGuestInfo({ name: '', phone: '', address: '', notes: '' });
  };

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Header onMenuOpen={() => setDrawer(true)} />
        <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 80px', paddingTop: 54 }}>

          {/* Page Title */}
          <div style={{ padding: '24px 0 20px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'Cairo' }}>
              {isRTL ? 'مراجعة طلبك' : 'Review Your Order'}
            </p>
            <h1 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 28, color: 'var(--ink)' }}>
              {step === 'cart' && (isRTL ? 'سلة التسوق' : 'Shopping Cart')}
              {step === 'info' && (isRTL ? 'معلومات التوصيل' : 'Delivery Info')}
              {step === 'confirm' && (isRTL ? 'تأكيد الطلب' : 'Confirm Order')}
              {cart.length > 0 && step === 'cart' && (
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--mid)', marginRight: 10, marginLeft: 10 }}>
                  ({cart.length} {isRTL ? 'منتج' : 'items'})
                </span>
              )}
            </h1>

            {/* Steps indicator */}
            {cart.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                {[
                  { key: 'cart', labelAr: 'السلة', labelEn: 'Cart' },
                  { key: 'info', labelAr: 'البيانات', labelEn: 'Info' },
                  { key: 'confirm', labelAr: 'تأكيد', labelEn: 'Confirm' },
                ].map((s, i) => (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: step === s.key ? 'var(--ink)' : ['cart', 'info', 'confirm'].indexOf(step) > i ? 'var(--ink)' : 'var(--border)',
                      color: step === s.key || ['cart', 'info', 'confirm'].indexOf(step) > i ? 'var(--paper)' : 'var(--mid)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, fontFamily: 'Cairo',
                      transition: 'all 0.3s',
                    }}>
                      {['cart', 'info', 'confirm'].indexOf(step) > i
                        ? <i className="fa-solid fa-check" style={{ fontSize: 10 }} />
                        : i + 1}
                    </div>
                    <span style={{ fontSize: 12, color: step === s.key ? 'var(--ink)' : 'var(--mid)', fontFamily: 'Cairo', fontWeight: step === s.key ? 700 : 400 }}>
                      {isRTL ? s.labelAr : s.labelEn}
                    </span>
                    {i < 2 && <div style={{ width: 24, height: 1, background: 'var(--border)' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── STEP 1: CART ── */}
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 20 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--paper-soft)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-bag-shopping" style={{ fontSize: 32, color: 'var(--mid)' }} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                    {isRTL ? 'سلتك فارغة' : 'Your cart is empty'}
                  </p>
                  <Link href="/" className="btn-primary">
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: 13 }} />
                    {isRTL ? 'تسوق الآن' : 'Shop Now'}
                  </Link>
                </motion.div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>

                  {/* Cart Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <AnimatePresence>
                      {cart.map(item => (
                        <motion.div
                          key={`${item.product.id}-${item.size}`}
                          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: isRTL ? -40 : 40, height: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ display: 'flex', gap: 14, padding: '14px', background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 14 }}
                        >
                          <Link href={`/product/${item.product.id}`}>
                            <div style={{ width: 90, height: 110, borderRadius: 10, overflow: 'hidden', background: '#f0f0ee', flexShrink: 0, position: 'relative' }}>
                              {item.product.images?.[0] && (item.product.images[0].startsWith('http') || item.product.images[0].startsWith('/')) ? (
                                <Image src={item.product.images[0]} alt="" fill className="object-cover" sizes="90px" />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="fa-solid fa-shirt" style={{ fontSize: 28, color: '#c8c8c4' }} />
                                </div>
                              )}
                            </div>
                          </Link>

                          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3, fontFamily: 'Cairo' }}>
                                  {item.product.category}
                                </p>
                                <Link href={`/product/${item.product.id}`}>
                                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'Cairo' }}>
                                    {isRTL ? (item.product as any).nameAr : (item.product as any).nameEn}
                                  </p>
                                </Link>
                                <span style={{ fontSize: 11, color: 'var(--mid)', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', fontFamily: 'Cairo', display: 'inline-block', marginTop: 4 }}>
                                  {isRTL ? 'المقاس:' : 'Size:'} {item.size}
                                </span>
                              </div>
                              <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeFromCart(item.product.id, item.size)}
                                style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--paper)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--mid)', flexShrink: 0 }}>
                                <i className="fa-solid fa-xmark" style={{ fontSize: 11 }} />
                              </motion.button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                              <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                                {item.product.price * item.quantity} {isRTL ? 'ج.م' : 'EGP'}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--paper)' }}>
                                <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
                                  <i className="fa-solid fa-minus" style={{ fontSize: 10 }} />
                                </motion.button>
                                <span style={{ width: 32, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', lineHeight: '32px' }}>
                                  {item.quantity}
                                </span>
                                <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
                                  <i className="fa-solid fa-plus" style={{ fontSize: 10 }} />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <button onClick={() => { clearCart(); toast.success(isRTL ? 'تم إفراغ السلة' : 'Cart cleared'); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid)', fontSize: 12, fontFamily: 'Cairo', padding: '4px 0' }}>
                      <i className="fa-solid fa-trash" style={{ fontSize: 11 }} />
                      {isRTL ? 'إفراغ السلة' : 'Clear cart'}
                    </button>
                  </div>

                  {/* Order Summary */}
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '20px', position: 'sticky', top: 70 }}>
                    <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 18, color: 'var(--ink)', marginBottom: 20 }}>
                      {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo' }}>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo' }}>{total} {isRTL ? 'ج.م' : 'EGP'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo' }}>{isRTL ? 'الشحن' : 'Shipping'}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#22c55e', fontFamily: 'Cairo' }}>{isRTL ? 'مجاني' : 'Free'}</span>
                      </div>
                      <div style={{ height: 1, background: 'var(--border)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>{isRTL ? 'الإجمالي' : 'Total'}</span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', fontFamily: 'Cairo' }}>{total} {isRTL ? 'ج.م' : 'EGP'}</span>
                      </div>
                    </div>

                    {/* Guest notice */}
                    {!user && (
                      <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '10px 12px', marginBottom: 14, display: 'flex', gap: 8 }}>
                        <i className="fa-solid fa-circle-check" style={{ fontSize: 14, color: '#22c55e', flexShrink: 0, marginTop: 2 }} />
                        <p style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', lineHeight: 1.6 }}>
                          {isRTL ? 'لا تحتاج لحساب — يمكنك الشراء كضيف' : 'No account needed — checkout as guest'}
                        </p>
                      </div>
                    )}

                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleCheckout} className="btn-primary" style={{ width: '100%', marginBottom: 10 }}>
                      <i className="fa-solid fa-arrow-left" style={{ fontSize: 13 }} />
                      {isRTL ? 'إتمام الشراء' : 'Proceed to Checkout'}
                    </motion.button>

                    <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', padding: '8px', textDecoration: 'none' }}>
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
                      {isRTL ? 'متابعة التسوق' : 'Continue Shopping'}
                    </Link>

                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {['fa-cc-visa', 'fa-cc-mastercard', 'fa-google-pay', 'fa-apple-pay'].map(icon => (
                        <i key={icon} className={`fa-brands ${icon}`} style={{ fontSize: 24, color: 'var(--mid)' }} />
                      ))}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--mid)', marginTop: 8, fontFamily: 'Cairo' }}>
                      <i className="fa-solid fa-shield-halved" style={{ fontSize: 11, marginLeft: 4, marginRight: 4 }} />
                      {isRTL ? 'دفع آمن ومشفر ١٠٠٪' : '100% Secure & Encrypted Payment'}
                    </p>
                  </motion.div>
                </div>
              )}
            </>
          )}

          {/* ── STEP 2: DELIVERY INFO ── */}
          {step === 'info' && (
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              style={{ maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 14, padding: 20 }}>
                <p style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 16 }}>
                  {isRTL ? 'بيانات التوصيل' : 'Delivery Details'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="input-group">
                    <label className="input-label">{isRTL ? 'الاسم الكامل *' : 'Full Name *'}</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={guestInfo.name}
                        onChange={e => setGuestInfo({ ...guestInfo, name: e.target.value })}
                        placeholder={isRTL ? 'اسمك الكامل' : 'Your full name'}
                        className="input-field"
                      />
                      <i className="fa-regular fa-user input-icon" />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">{isRTL ? 'رقم الهاتف *' : 'Phone Number *'}</label>
                    <div className="input-wrapper">
                      <input
                        type="tel"
                        value={guestInfo.phone}
                        onChange={e => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                        placeholder={isRTL ? '01xxxxxxxxx' : '01xxxxxxxxx'}
                        className="input-field"
                      />
                      <i className="fa-solid fa-phone input-icon" />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">{isRTL ? 'العنوان' : 'Address'}</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        value={guestInfo.address}
                        onChange={e => setGuestInfo({ ...guestInfo, address: e.target.value })}
                        placeholder={isRTL ? 'عنوان التوصيل' : 'Delivery address'}
                        className="input-field"
                      />
                      <i className="fa-solid fa-location-dot input-icon" />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">{isRTL ? 'ملاحظات' : 'Notes'}</label>
                    <textarea
                      value={guestInfo.notes}
                      onChange={e => setGuestInfo({ ...guestInfo, notes: e.target.value })}
                      placeholder={isRTL ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
                      className="textarea-field"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('cart')} className="btn-secondary" style={{ flex: 0 }}>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: 13 }} />
                  {isRTL ? 'رجوع' : 'Back'}
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm} className="btn-primary" style={{ flex: 1 }}>
                  {isRTL ? 'مراجعة الطلب' : 'Review Order'}
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 13 }} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: CONFIRM ── */}
          {step === 'confirm' && (
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              style={{ maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Order Items Summary */}
              <div style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 14, padding: 20 }}>
                <p style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 14 }}>
                  {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                </p>
                {cart.map(item => (
                  <div key={`${item.product.id}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                        {isRTL ? (item.product as any).nameAr : (item.product as any).nameEn}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo' }}>
                        {item.size} × {item.quantity}
                      </p>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo', fontSize: 13 }}>
                      {item.product.price * item.quantity} {isRTL ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                    {isRTL ? 'الإجمالي' : 'Total'}
                  </span>
                  <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                    {total} {isRTL ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>

              {/* Delivery Info Summary */}
              <div style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 14, padding: 20 }}>
                <p style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 12 }}>
                  {isRTL ? 'بيانات التوصيل' : 'Delivery Details'}
                </p>
                {[
                  { label: isRTL ? 'الاسم' : 'Name', value: guestInfo.name, icon: 'fa-user' },
                  { label: isRTL ? 'الهاتف' : 'Phone', value: guestInfo.phone, icon: 'fa-phone' },
                  { label: isRTL ? 'العنوان' : 'Address', value: guestInfo.address || (isRTL ? 'غير محدد' : 'Not specified'), icon: 'fa-location-dot' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <i className={`fa-solid ${f.icon}`} style={{ fontSize: 14, color: 'var(--mid)', marginTop: 3, width: 16, textAlign: 'center', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo' }}>{f.label}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo' }}>{f.value}</p>
                    </div>
                  </div>
                ))}
                <button onClick={() => setStep('info')} style={{ background: 'none', border: 'none', color: 'var(--mid)', fontSize: 12, fontFamily: 'Cairo', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="fa-solid fa-pen" style={{ fontSize: 10 }} />
                  {isRTL ? 'تعديل البيانات' : 'Edit details'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('info')} className="btn-secondary" style={{ flex: 0 }}>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: 13 }} />
                  {isRTL ? 'رجوع' : 'Back'}
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handlePlaceOrder} className="btn-primary" style={{ flex: 1 }}>
                  <i className="fa-solid fa-check" style={{ fontSize: 14 }} />
                  {isRTL ? 'تأكيد وإرسال الطلب' : 'Place Order'}
                </motion.button>
              </div>
            </motion.div>
          )}

        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}