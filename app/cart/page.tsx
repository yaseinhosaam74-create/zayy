'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CartPage() {
  const [drawer, setDrawer] = useState(false);
  const { language, cart, removeFromCart, updateQuantity, clearCart } = useStore();
  const { user } = useAuth();
  const isRTL = language === 'ar';

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountedTotal = cart.reduce((sum, item) => {
    const price = item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    if (!user) {
      toast.error(isRTL ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
      return;
    }
    toast.success(isRTL ? 'قريباً — بوابة الدفع' : 'Coming soon — Payment gateway');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Header onMenuOpen={() => setDrawer(true)} />
      <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 80px', paddingTop: 54 }}>

        {/* Page Title */}
        <div style={{ padding: '24px 0 20px' }}>
          <p style={{
            fontSize: 10, fontWeight: 700, color: 'var(--mid)',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            marginBottom: 6, fontFamily: 'Cairo, sans-serif',
          }}>
            {isRTL ? 'مراجعة طلبك' : 'Review Your Order'}
          </p>
          <h1 style={{
            fontFamily: 'Cairo, sans-serif', fontWeight: 900,
            fontSize: 28, color: 'var(--ink)',
          }}>
            {isRTL ? 'سلة التسوق' : 'Shopping Cart'}
            {cart.length > 0 && (
              <span style={{
                fontSize: 14, fontWeight: 400, color: 'var(--mid)',
                marginRight: 10, marginLeft: 10,
              }}>
                ({cart.length} {isRTL ? 'منتج' : 'items'})
              </span>
            )}
          </h1>
        </div>

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '80px 0', gap: 20,
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--paper-soft)',
              border: '1.5px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="fa-solid fa-bag-shopping" style={{ fontSize: 32, color: 'var(--mid)' }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--ink)', fontFamily: 'Cairo, sans-serif' }}>
              {isRTL ? 'سلتك فارغة' : 'Your cart is empty'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo, sans-serif' }}>
              {isRTL ? 'أضف منتجات تعجبك من المتجر' : 'Add products you love from the store'}
            </p>
            <Link href="/" className="btn-primary" style={{ marginTop: 8 }}>
              <i className="fa-solid fa-arrow-right" style={{ fontSize: 13 }} />
              {isRTL ? 'تسوق الآن' : 'Shop Now'}
            </Link>
          </motion.div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            alignItems: 'start',
          }}>

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
                    style={{
                      display: 'flex',
                      gap: 14,
                      padding: '14px',
                      background: 'var(--paper-soft)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 14,
                    }}
                  >
                    {/* Product Image */}
                    <Link href={`/product/${item.product.id}`}>
                      <div style={{
                        width: 90, height: 110,
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: '#f0f0ee',
                        flexShrink: 0,
                        position: 'relative',
                      }}>
                        {item.product.images?.[0] && (item.product.images[0].startsWith('http') || item.product.images[0].startsWith('/')) ? (
                          <Image
                            src={item.product.images[0]}
                            alt={isRTL ? item.product.nameAr : item.product.name}
                            fill
                            className="object-cover"
                            sizes="90px"
                          />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <i className="fa-solid fa-shirt" style={{ fontSize: 28, color: '#c8c8c4' }} />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 10, fontWeight: 700,
                            color: 'var(--mid)', textTransform: 'uppercase',
                            letterSpacing: '0.1em', marginBottom: 3,
                            fontFamily: 'Cairo, sans-serif',
                          }}>
                            {item.product.category}
                          </p>
                          <Link href={`/product/${item.product.id}`}>
                            <p style={{
                              fontSize: 13, fontWeight: 700,
                              color: 'var(--ink)', lineHeight: 1.4,
                              overflow: 'hidden', display: '-webkit-box',
                              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                              fontFamily: 'Cairo, sans-serif',
                            }}>
                              {isRTL ? item.product.nameAr : item.product.name}
                            </p>
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <span style={{
                              fontSize: 11, color: 'var(--mid)',
                              background: 'var(--paper)',
                              border: '1px solid var(--border)',
                              borderRadius: 4, padding: '2px 8px',
                              fontFamily: 'Cairo, sans-serif',
                            }}>
                              {isRTL ? 'المقاس:' : 'Size:'} {item.size}
                            </span>
                          </div>
                        </div>

                        {/* Remove */}
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          style={{
                            width: 28, height: 28,
                            borderRadius: 8,
                            background: 'var(--paper)',
                            border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--mid)',
                            flexShrink: 0, marginRight: isRTL ? 0 : undefined,
                            marginLeft: isRTL ? undefined : 8,
                          }}
                        >
                          <i className="fa-solid fa-xmark" style={{ fontSize: 11 }} />
                        </motion.button>
                      </div>

                      {/* Price + Quantity */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--ink)', fontFamily: 'Cairo, sans-serif' }}>
                          {item.product.price * item.quantity} {isRTL ? 'ج.م' : 'EGP'}
                        </p>

                        {/* Quantity Controls */}
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          border: '1.5px solid var(--border)',
                          borderRadius: 8, overflow: 'hidden',
                          background: 'var(--paper)',
                        }}>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                            style={{
                              width: 32, height: 32,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--ink)',
                            }}
                          >
                            <i className="fa-solid fa-minus" style={{ fontSize: 10 }} />
                          </motion.button>
                          <span style={{
                            width: 32, textAlign: 'center',
                            fontSize: 13, fontWeight: 700,
                            color: 'var(--ink)', fontFamily: 'Cairo, sans-serif',
                            borderLeft: '1px solid var(--border)',
                            borderRight: '1px solid var(--border)',
                            lineHeight: '32px',
                          }}>
                            {item.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                            style={{
                              width: 32, height: 32,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: 'var(--ink)',
                            }}
                          >
                            <i className="fa-solid fa-plus" style={{ fontSize: 10 }} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Clear Cart */}
              <button
                onClick={() => {
                  clearCart();
                  toast.success(isRTL ? 'تم إفراغ السلة' : 'Cart cleared');
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--mid)', fontSize: 12,
                  fontFamily: 'Cairo, sans-serif', padding: '4px 0',
                }}
              >
                <i className="fa-solid fa-trash" style={{ fontSize: 11 }} />
                {isRTL ? 'إفراغ السلة' : 'Clear cart'}
              </button>
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                background: 'var(--paper-soft)',
                border: '1.5px solid var(--border)',
                borderRadius: 16,
                padding: '20px',
                position: 'sticky',
                top: 70,
              }}
            >
              <h2 style={{
                fontFamily: 'Cairo, sans-serif', fontWeight: 900,
                fontSize: 18, color: 'var(--ink)', marginBottom: 20,
              }}>
                {isRTL ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo, sans-serif' }}>
                    {isRTL ? 'المجموع الفرعي' : 'Subtotal'}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo, sans-serif' }}>
                    {total} {isRTL ? 'ج.م' : 'EGP'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo, sans-serif' }}>
                    {isRTL ? 'الشحن' : 'Shipping'}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#22c55e', fontFamily: 'Cairo, sans-serif' }}>
                    {isRTL ? 'مجاني' : 'Free'}
                  </span>
                </div>

                <div style={{
                  height: 1, background: 'var(--border)',
                  margin: '4px 0',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo, sans-serif' }}>
                    {isRTL ? 'الإجمالي' : 'Total'}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--ink)', fontFamily: 'Cairo, sans-serif' }}>
                    {total} {isRTL ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>

              {/* Delivery Info */}
              <div style={{
                background: 'var(--paper)',
                border: '1px solid var(--border)',
                borderRadius: 10, padding: '12px 14px',
                marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <i className="fa-solid fa-truck-fast" style={{ fontSize: 15, color: 'var(--ink)' }} />
                <span style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo, sans-serif' }}>
                  {isRTL ? 'شحن مجاني على الطلبات فوق ٥٠٠ ج.م' : 'Free shipping on orders over 500 EGP'}
                </span>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCheckout}
                className="btn-primary"
                style={{ width: '100%', marginBottom: 10 }}
              >
                <i className="fa-solid fa-lock" style={{ fontSize: 13 }} />
                {isRTL ? 'إتمام الشراء' : 'Checkout'}
              </motion.button>

              <Link
                href="/"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, fontSize: 12, color: 'var(--mid)',
                  fontFamily: 'Cairo, sans-serif', padding: '8px',
                  textDecoration: 'none',
                }}
              >
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }} />
                {isRTL ? 'متابعة التسوق' : 'Continue Shopping'}
              </Link>

              {/* Payment Icons */}
              <div style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, flexWrap: 'wrap',
              }}>
                {['fa-cc-visa', 'fa-cc-mastercard', 'fa-google-pay', 'fa-apple-pay'].map(icon => (
                  <i key={icon} className={`fa-brands ${icon}`} style={{ fontSize: 24, color: 'var(--mid)' }} />
                ))}
              </div>
              <p style={{
                textAlign: 'center', fontSize: 11,
                color: 'var(--mid)', marginTop: 8,
                fontFamily: 'Cairo, sans-serif',
              }}>
                <i className="fa-solid fa-shield-halved" style={{ fontSize: 11, marginLeft: 4, marginRight: 4 }} />
                {isRTL ? 'دفع آمن ومشفر ١٠٠٪' : '100% Secure & Encrypted Payment'}
              </p>
            </motion.div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}