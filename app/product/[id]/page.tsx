'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  getProductById,
  getRelatedProducts,
  getActiveDiscountedPrice,
  isLowStock,
  isSizeAvailable,
  type Product,
} from '@/lib/firebase-store';

export default function ProductPage() {
  const { id } = useParams();
  const [drawer, setDrawer] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const { language, addToCart, toggleWishlist, isInWishlist } = useStore();
  const isRTL = language === 'ar';

  useEffect(() => {
    const load = async () => {
      const p = await getProductById(id as string);
      if (p) {
        setProduct(p);
        const rel = await getRelatedProducts(p);
        setRelated(rel);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: '80px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 40,
        }}>
          <div style={{ background: 'var(--paper-soft)', borderRadius: 12, aspectRatio: '3/4' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 20, background: 'var(--paper-soft)', borderRadius: 6, width: i === 1 ? '60%' : '100%' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: 48, color: 'var(--border)', marginBottom: 16, display: 'block' }} />
          <p style={{ color: 'var(--mid)', fontFamily: 'Cairo, sans-serif' }}>
            {isRTL ? 'المنتج غير موجود' : 'Product not found'}
          </p>
          <Link href="/" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = getActiveDiscountedPrice(product);
  const lowStock = isLowStock(product);
  const inWishlist = isInWishlist(product.id);

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

  const deliveryInfo = [
    { icon: 'fa-truck-fast', textAr: 'شحن مجاني على الطلبات فوق ٥٠٠ ج.م', textEn: 'Free shipping on orders over 500 EGP' },
    { icon: 'fa-rotate-left', textAr: 'إرجاع سهل خلال ١٤ يوم', textEn: '14-day easy returns' },
    { icon: 'fa-shield-halved', textAr: 'دفع آمن ١٠٠٪', textEn: '100% secure payment' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Header onMenuOpen={() => setDrawer(true)} />
      <Drawer isOpen={drawer} onClose={() => setDrawer(false)} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 80px', paddingTop: 54 }}>

        {/* Breadcrumb */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '16px 0 20px', fontSize: 12, color: 'var(--mid)',
          fontFamily: 'Cairo, sans-serif', flexWrap: 'wrap',
        }}>
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 40, alignItems: 'start',
        }}>

          {/* Images */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              position: 'relative', borderRadius: 12,
              overflow: 'hidden', background: 'var(--paper-soft)',
              aspectRatio: '3/4',
            }}>
              {product.images?.[activeImage] ? (
                <Image
                  src={product.images[activeImage]}
                  alt={isRTL ? product.nameAr : product.nameEn}
                  fill className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', background: '#f0f0ee',
                }}>
                  <i className="fa-solid fa-shirt" style={{ fontSize: 64, color: '#c8c8c4' }} />
                </div>
              )}

              {lowStock && (
                <span className="badge-stock" style={{ position: 'absolute', top: 12, insetInlineStart: 12 }}>
                  {isRTL ? 'كمية محدودة' : 'LOW STOCK'}
                </span>
              )}
            </div>

            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: 64, height: 72,
                      borderRadius: 8, overflow: 'hidden',
                      border: `2px solid ${activeImage === i ? 'var(--ink)' : 'var(--border)'}`,
                      background: 'var(--paper-soft)',
                      cursor: 'pointer', padding: 0, position: 'relative',
                    }}
                  >
                    <Image src={img} alt={`view ${i + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div>
              <p style={{
                fontSize: 11, fontWeight: 700, color: 'var(--mid)',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                marginBottom: 8, fontFamily: 'Cairo, sans-serif',
              }}>
                {product.category}
              </p>
              <h1 style={{
                fontFamily: 'Cairo, sans-serif', fontWeight: 900,
                fontSize: 26, color: 'var(--ink)', lineHeight: 1.25,
              }}>
                {isRTL ? product.nameAr : product.nameEn}
              </h1>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {discountedPrice ? (
                <>
                  <span style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 26, color: 'var(--ink)' }}>
                    {discountedPrice} {isRTL ? 'ج.م' : 'EGP'}
                  </span>
                  <span style={{ fontSize: 16, color: 'var(--mid)', textDecoration: 'line-through', fontFamily: 'Cairo' }}>
                    {product.price}
                  </span>
                  <span className="badge-sale">{isRTL ? 'خصم' : 'SALE'}</span>
                </>
              ) : (
                <span style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 26, color: 'var(--ink)' }}>
                  {product.price} {isRTL ? 'ج.م' : 'EGP'}
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{
              fontSize: 14, color: 'var(--mid)',
              lineHeight: 1.8, fontFamily: 'Cairo, sans-serif',
            }}>
              {isRTL ? product.descriptionAr : product.descriptionEn}
            </p>

            <div className="divider" />

            {/* Size Selector */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{
                  fontSize: 12, fontWeight: 700, color: 'var(--ink)',
                  letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Cairo',
                }}>
                  {isRTL ? 'المقاس' : 'Size'}
                  {selectedSize && (
                    <span style={{ color: 'var(--mid)', fontWeight: 400, marginRight: 8, marginLeft: 8 }}>
                      — {selectedSize}
                    </span>
                  )}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {product.sizes?.map(size => {
                  const available = isSizeAvailable(product, size);
                  const stock = product.stock?.[size] ?? 0;
                  const isLow = stock > 0 && stock < 5;
                  return (
                    <div key={size} style={{ position: 'relative' }}>
                      <button
                        className={`size-btn ${selectedSize === size ? 'selected' : ''} ${!available ? 'out' : ''}`}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                      >
                        {size}
                      </button>
                      {isLow && available && (
                        <span style={{
                          position: 'absolute', bottom: -16, left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: 9, color: '#e63946',
                          whiteSpace: 'nowrap', fontFamily: 'Cairo',
                        }}>
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
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className="btn-primary"
                style={{ flex: 1, opacity: added ? 0.75 : 1 }}
              >
                <i className={`fa-solid ${added ? 'fa-circle-check' : 'fa-bag-shopping'}`} style={{ fontSize: 15 }} />
                {added
                  ? isRTL ? '✓ تمت الإضافة' : '✓ Added'
                  : isRTL ? 'أضف للسلة' : 'Add to Cart'}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  toggleWishlist(product.id);
                  toast.success(inWishlist
                    ? isRTL ? 'تمت الإزالة من المفضلة' : 'Removed from wishlist'
                    : isRTL ? 'تمت الإضافة للمفضلة' : 'Added to wishlist'
                  );
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
            </div>

            {/* Delivery Info */}
            <div style={{
              background: 'var(--paper-soft)',
              border: '1.5px solid var(--border)',
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {deliveryInfo.map(d => (
                <div key={d.textEn} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 13, color: 'var(--mid)', fontFamily: 'Cairo',
                }}>
                  <i className={`fa-solid ${d.icon}`} style={{ fontSize: 15, color: 'var(--ink)', width: 20, textAlign: 'center' }} />
                  {isRTL ? d.textAr : d.textEn}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <div style={{ marginBottom: 24 }}>
              <p className="section-eyebrow">{isRTL ? 'اقتراحات' : 'You May Also Like'}</p>
              <h2 className="section-title">{isRTL ? 'منتجات مشابهة' : 'Related Products'}</h2>
            </div>
            <div className="product-grid">
              {related.map((p, i) => (
                <RelatedCard key={p.id} product={p} index={i} isRTL={isRTL} />
              ))}
            </div>
          </section>
        )}

      </div>
      <Footer />
    </div>
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
      <Link href={`/product/${product.id}`} style={{
        position: 'relative', display: 'block',
        overflow: 'hidden', background: 'var(--paper-soft)', aspectRatio: '3/4', borderRadius: 8,
      }}>
        {hasImage ? (
          <Image src={product.images[0]} alt={isRTL ? product.nameAr : product.nameEn}
            fill className="object-cover" sizes="25vw" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0ee' }}>
            <i className="fa-solid fa-shirt" style={{ fontSize: 32, color: '#c8c8c4' }} />
          </div>
        )}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
          style={{
            position: 'absolute', top: '8px', insetInlineEnd: '8px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: inWishlist ? '#1a1a1a' : 'rgba(255,255,255,0.92)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 2,
          }}
        >
          <i className={`${inWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`}
            style={{ fontSize: '13px', color: inWishlist ? '#fff' : '#1a1a1a' }} />
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