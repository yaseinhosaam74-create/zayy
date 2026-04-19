'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import type { Product } from '@/lib/firebase-store';
import { getActiveDiscountedPrice, isLowStock } from '@/lib/firebase-store';
type Props = { product: Product; index?: number };

export default function ProductCard({ product, index = 0 }: Props) {
  const { language, toggleWishlist, isInWishlist } = useStore();
  const isRTL = language === 'ar';
  const inWishlist = isInWishlist(product.id);
  const discountedPrice = getActiveDiscountedPrice(product);
  const lowStock = isLowStock(product);

  const hasValidImage =
    product.images?.[0] &&
    (product.images[0].startsWith('http') ||
      product.images[0].startsWith('/'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}
    >
      {/* Image */}
      <Link
        href={`/product/${product.id}`}
        style={{
          position: 'relative',
          display: 'block',
          overflow: 'hidden',
          background: '#f8f8f6',
          aspectRatio: '3/4',
        }}
      >
        {hasValidImage ? (
          <Image
            src={product.images[0]}
            alt={isRTL ? product.nameAr : product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 25vw"
            style={{ transition: 'transform 0.6s ease' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#f0f0ee',
          }}>
            <i className="fa-solid fa-shirt" style={{ fontSize: 32, color: '#c8c8c4' }} />
            <span style={{ fontSize: 11, color: '#c8c8c4', fontFamily: 'Cairo' }}>
              {isRTL ? 'لا توجد صورة' : 'No image'}
            </span>
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 8, insetInlineStart: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {discountedPrice && (
            <span className="badge-sale">
              {isRTL ? 'خصم' : 'SALE'}
            </span>
          )}
          {lowStock && (
            <span className="badge-stock">
              {isRTL ? 'كمية محدودة' : 'LOW STOCK'}
            </span>
          )}
        </div>

        {/* Wishlist */}
        <motion.button
  whileTap={{ scale: 0.75 }}
  onClick={e => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  }}
  style={{
    position: 'absolute' as const,
    top: '8px',
    insetInlineEnd: '8px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: inWishlist ? '#1a1a1a' : 'rgba(255,255,255,0.92)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    transition: 'all 0.2s',
    zIndex: 2,
  }}
>
  <i
    className={`${inWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`}
    style={{ fontSize: '13px', color: inWishlist ? '#fff' : '#1a1a1a' }}
  />
</motion.button>
      </Link>

      {/* Info */}
      <div style={{ padding: '10px 4px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#1a1a1a',
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            fontFamily: 'Cairo, sans-serif',
          }}>
            {isRTL ? product.nameAr : product.name}
          </h3>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {discountedPrice ? (
            <>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', fontFamily: 'Cairo' }}>
                {discountedPrice} {isRTL ? 'ج.م' : 'EGP'}
              </span>
              <span style={{ fontSize: 12, color: '#999', textDecoration: 'line-through', fontFamily: 'Cairo' }}>
                {product.price}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', fontFamily: 'Cairo' }}>
              {product.price} {isRTL ? 'ج.م' : 'EGP'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 2 }}>
          {product.sizes.slice(0, 4).map(s => (
            <span key={s} style={{
              fontSize: 10,
              color: '#999',
              border: '1px solid #e8e8e4',
              borderRadius: 3,
              padding: '1px 5px',
              fontFamily: 'Cairo',
            }}>
              {s}
            </span>
          ))}
          {product.sizes.length > 4 && (
            <span style={{ fontSize: 10, color: '#999', fontFamily: 'Cairo' }}>
              +{product.sizes.length - 4}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}