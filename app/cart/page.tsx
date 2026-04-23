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
import { createOrder } from '@/lib/firebase-store';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

type Step = 'cart' | 'info' | 'confirm';

const STATUS_STEPS = [
  { key: 'cart', labelAr: 'السلة', labelEn: 'Cart' },
  { key: 'info', labelAr: 'البيانات', labelEn: 'Info' },
  { key: 'confirm', labelAr: 'تأكيد', labelEn: 'Confirm' },
];

export default function CartPage() {
  const [drawer, setDrawer] = useState(false);
  const [step, setStep] = useState<Step>('cart');
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '', address: '', notes: '' });
  const [placing, setPlacing] = useState(false);

  const { language, cart, removeFromCart, updateQuantity, clearCart } = useStore();
  const { user, userData } = useAuth();
  const isRTL = language === 'ar';

  const total = cart.reduce((s, item) => s + item.product.price * item.quantity, 0);
  const coinDiscount = Math.min((userData?.coins || 0) * 5, total);

  const handlePlaceOrder = async () => {
    if (!guestInfo.name || !guestInfo.phone) {
      toast.error(isRTL ? 'يرجى ملء الاسم ورقم الهاتف' : 'Fill name and phone');
      return;
    }
    setPlacing(true);
    try {
      const orderId = await createOrder({
        userId: user?.uid || 'guest',
        guestInfo,
        items: cart.map(item => ({
          productId: item.product.id,
          nameAr: item.product.nameAr || '',
          nameEn: item.product.nameEn || '',
          price: item.product.price,
          size: item.size,
          quantity: item.quantity,
          image: item.product.images?.[0] || '',
          color: item.color,
        })),
        total: total - coinDiscount,
        status: 'pending',
      });

      clearCart();
      setStep('cart');
      toast.success(isRTL
        ? `✅ تم إرسال طلبك #${orderId.slice(-6).toUpperCase()}! سنتواصل معك قريباً`
        : `✅ Order #${orderId.slice(-6).toUpperCase()} placed! We'll contact you soon`);
    } catch {
      toast.error(isRTL ? 'فشل إرسال الطلب. حاول مرة أخرى' : 'Order failed. Try again');
    }
    setPlacing(false);
  };

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Header onMenuOpen={() => setDrawer(true)} />
        <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 16px 80px' }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 26, color: 'var(--ink)', marginBottom: 14 }}>
              {step === 'cart' && (isRTL ? 'سلة التسوق' : 'Cart')}
              {step === 'info' && (isRTL ? 'بيانات التوصيل' : 'Delivery Info')}
              {step === 'confirm' && (isRTL ? 'تأكيد الطلب' : 'Confirm Order')}
            </h1>

            {cart.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {STATUS_STEPS.map((s, i) => {
                  const steps = STATUS_STEPS.map(x => x.key);
                  const current = steps.indexOf(step);
                  const isActive = i <= current;
                  const isDone = i < current;
                  return (
                    <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: isActive ? 'var(--ink)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                          {isDone
                            ? <i className="fa-solid fa-check" style={{ fontSize: 9, color: 'var(--paper)' }} />
                            : <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? 'var(--paper)' : 'var(--mid)', fontFamily: 'Cairo' }}>{i + 1}</span>}
                        </div>
                        <span style={{ fontSize: 11, color: isActive ? 'var(--ink)' : 'var(--mid)', fontFamily: 'Cairo', fontWeight: isActive ? 700 : 400 }}>
                          {isRTL ? s.labelAr : s.labelEn}
                        </span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div style={{ width: 20, height: 1, background: i < current ? 'var(--ink)' : 'var(--border)', transition: 'background 0.3s' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── CART ── */}
          {step === 'cart' && (
            cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--paper-soft)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <i className="fa-solid fa-bag-shopping" style={{ fontSize: 32, color: 'var(--mid)' }} />
                </div>
                <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', fontFamily: 'Cairo', marginBottom: 16 }}>
                  {isRTL ? 'سلتك فارغة' : 'Your cart is empty'}
                </p>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />
                  {isRTL ? 'تسوق الآن' : 'Shop Now'}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {cart.map(item => (
                    <motion.div key={`${item.product.id}-${item.size}`}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', gap: 14, padding: 14, background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 14 }}>
                      <div style={{ width: 86, height: 104, borderRadius: 10, overflow: 'hidden', background: 'var(--border)', flexShrink: 0, position: 'relative' }}>
                        {item.product.images?.[0] && (
                          <Image src={item.product.images[0]} alt="" fill className="object-cover" sizes="86px" />
                        )}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo', lineHeight: 1.4, flex: 1 }}>
                            {isRTL ? item.product.nameAr : item.product.nameEn}
                          </p>
                          <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeFromCart(item.product.id, item.size)}
                            style={{ width: 26, height: 26, borderRadius: 7, background: 'none', border: '1px solid var(--border)', color: 'var(--mid)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className="fa-solid fa-xmark" style={{ fontSize: 10 }} />
                          </motion.button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: 'var(--mid)', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 8px', fontFamily: 'Cairo' }}>
                            {isRTL ? 'مقاس:' : 'Size:'} {item.size}
                          </span>
                          {item.color && (
                            <span style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo' }}>{item.color}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                            {item.product.price * item.quantity} {isRTL ? 'ج.م' : 'EGP'}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
                              <i className="fa-solid fa-minus" style={{ fontSize: 9 }} />
                            </motion.button>
                            <span style={{ width: 30, textAlign: 'center', fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', lineHeight: '30px' }}>
                              {item.quantity}
                            </span>
                            <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
                              <i className="fa-solid fa-plus" style={{ fontSize: 9 }} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Summary */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20, position: 'sticky', top: 70 }}>
                  <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 17, color: 'var(--ink)', marginBottom: 18 }}>
                    {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo' }}>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo' }}>{total} {isRTL ? 'ج.م' : 'EGP'}</span>
                    </div>
                    {coinDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: '#eab308', fontFamily: 'Cairo' }}>🪙 {isRTL ? 'خصم ZaayCoin' : 'ZaayCoin Discount'}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#eab308', fontFamily: 'Cairo' }}>-{coinDiscount} {isRTL ? 'ج.م' : 'EGP'}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo' }}>{isRTL ? 'الشحن' : 'Shipping'}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e', fontFamily: 'Cairo' }}>{isRTL ? 'مجاني' : 'Free'}</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--border)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>{isRTL ? 'الإجمالي' : 'Total'}</span>
                      <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', fontFamily: 'Cairo' }}>{total - coinDiscount} {isRTL ? 'ج.م' : 'EGP'}</span>
                    </div>
                  </div>

                  {!user && (
                    <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                      <p style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', lineHeight: 1.6 }}>
                        <i className="fa-solid fa-circle-check" style={{ color: '#22c55e', marginLeft: 4, marginRight: 4 }} />
                        {isRTL ? 'لا تحتاج لحساب — يمكنك الشراء كضيف' : 'No account needed — checkout as guest'}
                      </p>
                    </div>
                  )}

                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('info')}
                    style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                    <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }} />
                    {isRTL ? 'إتمام الشراء' : 'Checkout'}
                  </motion.button>
                  <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo' }}>
                    <i className="fa-solid fa-shield-halved" style={{ marginLeft: 4, marginRight: 4 }} />
                    {isRTL ? 'دفع آمن ومشفر' : 'Secure & encrypted payment'}
                  </p>
                </motion.div>
              </div>
            )
          )}

          {/* ── INFO ── */}
          {step === 'info' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 22 }}>
                <p style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 16 }}>
                  {isRTL ? 'بيانات التوصيل' : 'Delivery Details'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: isRTL ? 'الاسم الكامل *' : 'Full Name *', key: 'name', type: 'text', icon: 'fa-user', placeholder: isRTL ? 'اسمك الكامل' : 'Your name' },
                    { label: isRTL ? 'رقم الهاتف *' : 'Phone *', key: 'phone', type: 'tel', icon: 'fa-phone', placeholder: '01xxxxxxxxx' },
                    { label: isRTL ? 'العنوان' : 'Address', key: 'address', type: 'text', icon: 'fa-location-dot', placeholder: isRTL ? 'عنوان التوصيل' : 'Delivery address' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', display: 'block', marginBottom: 6 }}>{f.label}</label>
                      <div style={{ position: 'relative' }}>
                        <input type={f.type} value={(guestInfo as any)[f.key]} onChange={e => setGuestInfo({ ...guestInfo, [f.key]: e.target.value })}
                          placeholder={f.placeholder}
                          style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--paper)', color: 'var(--ink)', fontSize: 14, fontFamily: 'Cairo', boxSizing: 'border-box', outline: 'none' }} />
                        <i className={`fa-solid ${f.icon}`} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineEnd: 14, color: 'var(--mid)', fontSize: 13 }} />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', display: 'block', marginBottom: 6 }}>
                      {isRTL ? 'ملاحظات' : 'Notes'}
                    </label>
                    <textarea value={guestInfo.notes} onChange={e => setGuestInfo({ ...guestInfo, notes: e.target.value })}
                      placeholder={isRTL ? 'أي ملاحظات إضافية...' : 'Any notes...'} rows={3}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--paper)', color: 'var(--ink)', fontSize: 14, fontFamily: 'Cairo', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('cart')}
                  style={{ flex: 0, padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
                  {isRTL ? 'رجوع' : 'Back'}
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { if (!guestInfo.name || !guestInfo.phone) { toast.error(isRTL ? 'ملء الاسم والهاتف مطلوب' : 'Name and phone required'); return; } setStep('confirm'); }}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isRTL ? 'مراجعة الطلب' : 'Review Order'}
                  <i className="fa-solid fa-arrow-left" style={{ fontSize: 11 }} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── CONFIRM ── */}
          {step === 'confirm' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 20 }}>
                <p style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 14 }}>
                  {isRTL ? 'ملخص الطلب' : 'Order Summary'}
                </p>
                {cart.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                        {isRTL ? item.product.nameAr : item.product.nameEn}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo' }}>{item.size} × {item.quantity}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                      {item.product.price * item.quantity} {isRTL ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                ))}
                <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>{isRTL ? 'الإجمالي' : 'Total'}</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', fontFamily: 'Cairo' }}>{total - coinDiscount} {isRTL ? 'ج.م' : 'EGP'}</span>
                </div>
              </div>

              <div style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{isRTL ? 'بيانات التوصيل' : 'Delivery Info'}</p>
                  <button onClick={() => setStep('info')} style={{ background: 'none', border: 'none', color: 'var(--mid)', fontSize: 12, fontFamily: 'Cairo', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="fa-solid fa-pen" style={{ fontSize: 10 }} />
                    {isRTL ? 'تعديل' : 'Edit'}
                  </button>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ink)', fontFamily: 'Cairo', marginBottom: 4 }}>{guestInfo.name}</p>
                <p style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo' }}>{guestInfo.phone}</p>
                {guestInfo.address && <p style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo' }}>{guestInfo.address}</p>}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep('info')}
                  style={{ flex: 0, padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
                  {isRTL ? 'رجوع' : 'Back'}
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handlePlaceOrder} disabled={placing}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: placing ? '#333' : 'var(--ink)', color: 'var(--paper)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, cursor: placing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {placing ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-check" />}
                  {placing ? (isRTL ? 'جاري الإرسال...' : 'Placing...') : (isRTL ? 'تأكيد وإرسال الطلب' : 'Place Order')}
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