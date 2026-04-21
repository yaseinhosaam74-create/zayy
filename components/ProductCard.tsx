'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getActiveDiscountedPrice, isLowStock, type Product } from '@/lib/firebase-store';
import toast from 'react-hot-toast';

type Props = { product: Product; index?: number };

export default function ProductCard({ product, index = 0 }: Props) {
  const { language, toggleWishlist, isInWishlist } = useStore();
  const isRTL = language === 'ar';
  const inWishlist = isInWishlist(product.id);
  const discountedPrice = getActiveDiscountedPrice(product);
  const lowStock = isLowStock(product);
  const [hovered, setHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const hasImage = product.images?.[0] &&
    (product.images[0].startsWith('http') || product.images[0].startsWith('/'));

  const hasSecondImage = product.images?.length > 1 &&
    (product.images[1].startsWith('http') || product.images[1].startsWith('/'));

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.id}`;
    const name = isRTL ? product.nameAr : product.nameEn;
    const desc = isRTL ? product.descriptionAr : product.descriptionEn;

    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: desc,
          url: url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(isRTL ? 'تم نسخ الرابط' : 'Link copied');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      style={{ display: 'flex', flexDirection: 'column', background: 'var(--card)' }}
      onMouseEnter={() => { setHovered(true); if (hasSecondImage) setImageIndex(1); }}
      onMouseLeave={() => { setHovered(false); setImageIndex(0); }}
    >
      <Link href={`/product/${product.id}`} style={{
        position: 'relative', display: 'block',
        overflow: 'hidden', background: 'var(--paper-soft)',
        aspectRatio: '3/4',
      }}>
        {hasImage ? (
          <motion.div
            style={{ position: 'absolute', inset: 0 }}
            animate={{ scale: hovered ? 1.04 : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Image
              src={product.images[imageIndex] || product.images[0]}
              alt={isRTL ? product.nameAr : product.nameEn}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
              style={{ transition: 'opacity 0.3s' }}
            />
          </motion.div>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f0f0ee' }}>
            <i className="fa-solid fa-shirt" style={{ fontSize: 32, color: '#c8c8c4' }} />
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 8, insetInlineStart: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {discountedPrice && <span className="badge-sale">{isRTL ? 'خصم' : 'SALE'}</span>}
          {lowStock && <span className="badge-stock">{isRTL ? 'كمية محدودة' : 'LOW STOCK'}</span>}
        </div>

        {/* Hover overlay with quick actions */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
                display: 'flex', alignItems: 'flex-end',
                justifyContent: 'center', padding: '12px',
              }}
            >
              <motion.span
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                  color: '#fff', fontFamily: 'Cairo', fontSize: 12,
                  fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {isRTL ? 'عرض المنتج' : 'View Product'}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div style={{ position: 'absolute', top: 8, insetInlineEnd: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <motion.button
            whileTap={{ scale: 0.75 }}
            onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: inWishlist ? '#1a1a1a' : 'rgba(255,255,255,0.92)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            <i className={`${inWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`}
              style={{ fontSize: '13px', color: inWishlist ? '#fff' : '#1a1a1a' }} />
          </motion.button>

          <AnimatePresence>
            {hovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                whileTap={{ scale: 0.75 }}
                onClick={handleShare}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.92)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
              >
                <i className="fa-solid fa-share-nodes" style={{ fontSize: '13px', color: '#1a1a1a' }} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '10px 4px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: 'Cairo, sans-serif' }}>
            {isRTL ? product.nameAr : product.nameEn}
          </h3>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {discountedPrice ? (
            <>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                {discountedPrice} {isRTL ? 'ج.م' : 'EGP'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--mid)', textDecoration: 'line-through', fontFamily: 'Cairo' }}>
                {product.price}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>
              {product.price} {isRTL ? 'ج.م' : 'EGP'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 2 }}>
          {product.sizes?.slice(0, 4).map(s => (
            <span key={s} style={{ fontSize: 10, color: 'var(--mid)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', fontFamily: 'Cairo' }}>{s}</span>
          ))}
          {product.sizes?.length > 4 && (
            <span style={{ fontSize: 10, color: 'var(--mid)', fontFamily: 'Cairo' }}>+{product.sizes.length - 4}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}