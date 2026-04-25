'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import FitAdvisor from '@/components/FitAdvisor';
import ShopTheLook from '@/components/ShopTheLook';
import ImageZoom from '@/components/ImageZoom';
import PageTransition from '@/components/PageTransition';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getProductById,
  getRelatedProducts,
  getActiveDiscountedPrice,
  isLowStock,
  getLowStockCount,
  isSizeAvailable,
  type Product,
  type ProductColor,
} from '@/lib/firebase-store';

const PRESET_COLORS = [
  { name: 'Black', nameAr: 'أسود', hex: '#1a1a1a' },
  { name: 'White', nameAr: 'أبيض', hex: '#f5f5f5' },
  { name: 'Grey', nameAr: 'رمادي', hex: '#9ca3af' },
  { name: 'Navy', nameAr: 'كحلي', hex: '#1e3a5f' },
  { name: 'Beige', nameAr: 'بيج', hex: '#d4b896' },
  { name: 'Brown', nameAr: 'بني', hex: '#92400e' },
  { name: 'Green', nameAr: 'أخضر', hex: '#166534' },
  { name: 'Red', nameAr: 'أحمر', hex: '#dc2626' },
  { name: 'Burgundy', nameAr: 'عنابي', hex: '#7f1d1d' },
  { name: 'Cream', nameAr: 'كريمي', hex: '#fffbeb' },
  { name: 'Olive', nameAr: 'زيتي', hex: '#65a30d' },
  { name: 'Camel', nameAr: 'كاميل', hex: '#c19a6b' },
];

export default function ProductPage() {
  const { id } = useParams();
  const [drawer, setDrawer] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [added, setAdded] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { language, addToCart, toggleWishlist, isInWishlist } = useStore();
  const isRTL = language === 'ar';

  useEffect(() => {
    const load = async () => {
      const p = await getProductById(id as string);
      if (p) {
        setProduct(p);
        if (p.colors && p.colors.length > 0) {
          setSelectedColor(p.colors[0]);
        }
        const rel = await getRelatedProducts(p);
        setRelated(rel.filter(r => r.id !== p.id).slice(0, 4));
      }
      setLoading(false);
    };
    load();
  }, [id]);

  // Get current images based on selected color
  const currentImages = selectedColor?.images?.length
    ? selectedColor.images
    : product?.images || [];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', paddingTop: 54 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
        <div style={{ background: 'var(--paper-soft)', borderRadius: 12, aspectRatio: '3/4' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: 20, background: 'var(--paper-soft)', borderRadius: 6, width: i === 1 ? '60%' : '100%' }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <i className="fa-solid fa-box-open" style={{ fontSize: 48, color: 'var(--border)', marginBottom: 16, display: 'block' }} />
        <p style={{ color: 'var(--mid)', fontFamily: 'Cairo' }}>
          {isRTL ? 'المنتج غير موجود' : 'Product not found'}
        </p>
        <Link href="/" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
          {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </div>
    </div>
  );

  const discountedPrice = getActiveDiscountedPrice(product);
  const lowStock = isLowStock(product);
  const lowStockCount = getLowStockCount(product);
  const inWishlist = isInWishlist(product.id);
  const currentPrice = discountedPrice || product.price;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error(isRTL ? 'يرجى اختيار المقاس أولاً' : 'Please select a size first');
      return;
    }
    addToCart(product as any, selectedSize);
    setAdded(true);
    toast.success(isRTL ? 'تمت الإضافة للسلة' : 'Added to cart');
    setTimeout(() => setAdded(false), 2500);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${product.id}`;
    const name = isRTL ? product.nameAr : product.nameEn;
    const desc = isRTL ? product.descriptionAr : product.descriptionEn;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: desc, url });
        return;
      } catch {}
    }
    setShowShare(true);
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.id}` : '';
  const shareText = isRTL ? product.nameAr : product.nameEn;

  const shareOptions = [
    { name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366', url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}` },
    { name: 'Twitter / X', icon: 'fa-x-twitter', color: '#000', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { name: 'Facebook', icon: 'fa-facebook-f', color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'Telegram', icon: 'fa-telegram', color: '#2AABEE', url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}` },
  ];

  const deliveryInfo = [
    { icon: 'fa-truck-fast', textAr: 'شحن مجاني على الطلبات فوق ٥٠٠ ج.م', textEn: 'Free shipping on orders over 500 EGP' },
    { icon: 'fa-rotate-left', textAr: 'إرجاع سهل خلال ١٤ يوم', textEn: '14-day easy returns' },
    { icon: 'fa-shield-halved', textAr: 'دفع آمن ١٠٠٪', textEn: '100% secure payment' },
  ];

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Header onMenuOpen={() => setDrawer(true)} />
        <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 80px', paddingTop: 54 }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 0 20px', fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'var(--mid)', textDecoration: 'none' }}>
              {isRTL ? 'الرئيسية' : 'Home'}
            </Link>
            <i className={`fa-solid ${isRTL ? 'fa-chevron-left' : 'fa-chevron-right'}`} style={{ fontSize: 9 }} />
            <Link href={product.gender === 'men' ? '/men' : '/women'} style={{ color: 'var(--mid)', textDecoration: 'none' }}>
              {product.gender === 'men' ? (isRTL ? 'رجال' : 'Men') : (isRTL ? 'نساء' : 'Women')}
            </Link>
            <i className={`fa-solid ${isRTL ? 'fa-chevron-left' : 'fa-chevron-right'}`} style={{ fontSize: 9 }} />
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
              {isRTL ? product.nameAr : product.nameEn}
            </span>
          </div>

          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'start' }}>

            {/* Images with Zoom */}
            <ImageZoom
              images={currentImages.filter(img => img && (img.startsWith('http') || img.startsWith('/')))}
              alt={isRTL ? product.nameAr : product.nameEn}
            />

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Header */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{ fontSize: 11, fontWeight: 700, color: 'var(--mid)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Cairo' }}>
                      {product.category}
                    </motion.p>
                    <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                      style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 26, color: 'var(--ink)', lineHeight: 1.25 }}>
                      {isRTL ? product.nameAr : product.nameEn}
                    </motion.h1>
                  </div>

                  {/* Share Button */}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={handleShare}
                    style={{ width: 40, height: 40, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--paper)', color: 'var(--mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <i className="fa-solid fa-share-nodes" style={{ fontSize: 16 }} />
                  </motion.button>
                </div>
              </div>

              {/* Price */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {discountedPrice ? (
                  <>
                    <span style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 28, color: 'var(--ink)' }}>
                      {discountedPrice} {isRTL ? 'ج.م' : 'EGP'}
                    </span>
                    <span style={{ fontSize: 18, color: 'var(--mid)', textDecoration: 'line-through', fontFamily: 'Cairo' }}>
                      {product.price}
                    </span>
                    <span className="badge-sale">{isRTL ? 'خصم' : 'SALE'}</span>
                  </>
                ) : (
                  <span style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 28, color: 'var(--ink)' }}>
                    {product.price} {isRTL ? 'ج.م' : 'EGP'}
                  </span>
                )}
              </motion.div>

              {/* Low Stock Warning */}
              {lowStock && lowStockCount > 0 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 8, padding: '8px 12px' }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 13, color: '#e63946' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#e63946', fontFamily: 'Cairo' }}>
                    {isRTL ? `آخر ${lowStockCount} قطع متبقية!` : `Only ${lowStockCount} pieces left!`}
                  </span>
                </motion.div>
              )}

              {/* Description */}
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                style={{ fontSize: 14, color: 'var(--mid)', lineHeight: 1.8, fontFamily: 'Cairo' }}>
                {isRTL ? product.descriptionAr : product.descriptionEn}
              </motion.p>

              <div style={{ height: 1, background: 'var(--border)' }} />

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Cairo', marginBottom: 12 }}>
                    {isRTL ? 'اللون' : 'Color'}
                    {selectedColor && (
                      <span style={{ color: 'var(--mid)', fontWeight: 400, marginRight: 8, marginLeft: 8 }}>
                        — {isRTL ? selectedColor.nameAr : selectedColor.name}
                      </span>
                    )}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {product.colors.map((color, i) => (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => setSelectedColor(color)}
                        title={isRTL ? color.nameAr : color.name}
                        style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: color.hex,
                          border: selectedColor?.hex === color.hex
                            ? '3px solid var(--ink)'
                            : '2px solid var(--border)',
                          cursor: 'pointer', padding: 0,
                          boxShadow: selectedColor?.hex === color.hex ? '0 0 0 2px var(--paper), 0 0 0 4px var(--ink)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Size Selector */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Cairo', marginBottom: 12 }}>
                  {isRTL ? 'المقاس' : 'Size'}
                  {selectedSize && (
                    <span style={{ color: 'var(--mid)', fontWeight: 400, marginRight: 8, marginLeft: 8 }}>— {selectedSize}</span>
                  )}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.sizes?.map(size => {
                    const available = isSizeAvailable(product, size);
                    const stock = product.stock?.[size] ?? 0;
                    const isLowSize = stock > 0 && stock < 5;
                    return (
                      <div key={size} style={{ position: 'relative' }}>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className={`size-btn ${selectedSize === size ? 'selected' : ''} ${!available ? 'out' : ''}`}
                          onClick={() => available && setSelectedSize(size)}
                          disabled={!available}
                        >
                          {size}
                        </motion.button>
                        {isLowSize && available && (
                          <span style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: '#e63946', whiteSpace: 'nowrap', fontFamily: 'Cairo' }}>
                            {isRTL ? `${stock} فقط` : `${stock} left`}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!selectedSize && (
                  <p style={{ fontSize: 12, color: 'var(--mid)', marginTop: 20, fontFamily: 'Cairo' }}>
                    {isRTL ? 'اختر مقاساً للمتابعة' : 'Select a size to continue'}
                  </p>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className="btn-primary"
                  style={{ flex: 1, opacity: added ? 0.75 : 1 }}
                >
                  <i className={`fa-solid ${added ? 'fa-circle-check' : 'fa-bag-shopping'}`} style={{ fontSize: 15 }} />
                  {added
                    ? (isRTL ? '✓ تمت الإضافة' : '✓ Added')
                    : (isRTL ? 'أضف للسلة' : 'Add to Cart')}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => {
                    toggleWishlist(product.id);
                    toast.success(inWishlist
                      ? (isRTL ? 'تمت الإزالة من المفضلة' : 'Removed from wishlist')
                      : (isRTL ? 'تمت الإضافة للمفضلة' : 'Added to wishlist'));
                  }}
                  style={{
                    width: 52, height: 52, borderRadius: 10,
                    border: `1.5px solid ${inWishlist ? '#1a1a1a' : 'var(--border)'}`,
                    background: inWishlist ? '#1a1a1a' : 'var(--paper)',
                    color: inWishlist ? '#fff' : 'var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <i className={`${inWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`} style={{ fontSize: 18 }} />
                </motion.button>
              </motion.div>

              {/* Guest Checkout Notice */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="fa-solid fa-user-check" style={{ fontSize: 16, color: 'var(--ink)', flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo', lineHeight: 1.6 }}>
                  {isRTL
                    ? 'يمكنك إتمام الشراء بدون حساب — فقط أضف للسلة واضغط إتمام الشراء'
                    : 'You can checkout without an account — just add to cart and proceed'}
                </p>
              </motion.div>

              {/* Delivery Info */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}
                style={{ background: 'var(--paper-soft)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {deliveryInfo.map(d => (
                  <div key={d.textEn} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo' }}>
                    <i className={`fa-solid ${d.icon}`} style={{ fontSize: 15, color: 'var(--ink)', width: 20, textAlign: 'center' }} />
                    {isRTL ? d.textAr : d.textEn}
                  </div>
                ))}
              </motion.div>

              {/* FitAdvisor */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <FitAdvisor sizes={product.sizes || []} />
              </motion.div>

              {/* ShopTheLook */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <ShopTheLook product={product} />
              </motion.div>

            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginTop: 64 }}>
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4, fontFamily: 'Cairo' }}>
                  {isRTL ? 'اقتراحات' : 'You May Also Like'}
                </p>
                <h2 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 22, color: 'var(--ink)' }}>
                  {isRTL ? 'منتجات مشابهة' : 'Related Products'}
                </h2>
              </div>
              <div className="product-grid">
                {related.map((p, i) => <RelatedCard key={p.id} product={p} index={i} isRTL={isRTL} />)}
              </div>
            </motion.section>
          )}

        </div>

        <Footer />

        {/* Share Modal */}
        <AnimatePresence>
          {showShare && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 }}
              onClick={() => setShowShare(false)}>
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                style={{ width: '100%', maxWidth: 480, background: 'var(--paper)', borderRadius: 20, padding: 24 }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 17, color: 'var(--ink)' }}>
                    {isRTL ? 'مشاركة المنتج' : 'Share Product'}
                  </h3>
                  <button onClick={() => setShowShare(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid)', fontSize: 18 }}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>

                {/* Product Preview in Share */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: '12px', background: 'var(--paper-soft)', borderRadius: 12 }}>
                  {currentImages[0] && (
                    <div style={{ width: 56, height: 68, borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                      <Image src={currentImages[0]} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                      {isRTL ? product.nameAr : product.nameEn}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo', marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {isRTL ? product.descriptionAr : product.descriptionEn}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                  {shareOptions.map(opt => (
                    <a key={opt.name} href={opt.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`fa-brands ${opt.icon}`} style={{ fontSize: 20, color: '#fff' }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--mid)', fontFamily: 'Cairo' }}>{opt.name}</span>
                    </a>
                  ))}
                </div>

                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success(isRTL ? 'تم نسخ الرابط' : 'Link copied');
                    setShowShare(false);
                  }}
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'Cairo', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <i className="fa-solid fa-copy" />
                  {isRTL ? 'نسخ الرابط' : 'Copy Link'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}

function RelatedCard({ product, index, isRTL }: { product: Product; index: number; isRTL: boolean }) {
  const { toggleWishlist, isInWishlist } = useStore();
  const inWishlist = isInWishlist(product.id);
  const discountedPrice = getActiveDiscountedPrice(product);
  const hasImage = product.images?.[0] && (product.images[0].startsWith('http') || product.images[0].startsWith('/'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <Link href={`/product/${product.id}`} style={{ position: 'relative', display: 'block', overflow: 'hidden', background: 'var(--paper-soft)', aspectRatio: '3/4', borderRadius: 10 }}>
        {hasImage ? (
          <Image src={product.images[0]} alt={isRTL ? product.nameAr : product.nameEn} fill className="object-cover" sizes="25vw" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0ee' }}>
            <i className="fa-solid fa-shirt" style={{ fontSize: 32, color: '#c8c8c4' }} />
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
          style={{ position: 'absolute', top: '8px', insetInlineEnd: '8px', width: '32px', height: '32px', borderRadius: '50%', background: inWishlist ? '#1a1a1a' : 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 2 }}>
          <i className={`${inWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`} style={{ fontSize: '13px', color: inWishlist ? '#fff' : '#1a1a1a' }} />
        </motion.button>
      </Link>
      <div style={{ padding: '10px 4px 12px' }}>
        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {isRTL ? product.nameAr : product.nameEn}
          </h3>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          {discountedPrice ? (
            <>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>{discountedPrice} {isRTL ? 'ج.م' : 'EGP'}</span>
              <span style={{ fontSize: 12, color: 'var(--mid)', textDecoration: 'line-through', fontFamily: 'Cairo' }}>{product.price}</span>
            </>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>{product.price} {isRTL ? 'ج.م' : 'EGP'}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}