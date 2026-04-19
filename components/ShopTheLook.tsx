'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import type { Product } from '@/lib/firebase-store';
import { getAllProducts } from '@/lib/firebase-store';

type Props = { product: Product };

export default function ShopTheLook({ product }: Props) {
  const { language } = useStore();
  const isRTL = language === 'ar';
  const all = getAllProducts();

  const categoryMap: Record<string, string[]> = {
    't-shirt': ['pants', 'jacket', 'hoodie'],
    'pants': ['t-shirt', 'hoodie', 'jacket'],
    'hoodie': ['pants', 't-shirt'],
    'jacket': ['pants', 't-shirt'],
    'all': ['pants', 't-shirt', 'hoodie'],
  };

  const complementary = categoryMap[product.category] || ['pants', 't-shirt'];
  const outfit: Product[] = [];
  const sameGender = all.filter(p => p.gender === product.gender && p.id !== product.id);

  complementary.forEach(cat => {
    const found = sameGender.find(p => p.category === cat && !outfit.find(o => o.id === p.id));
    if (found) outfit.push(found);
  });

  const outfitSlice = outfit.slice(0, 2);
  if (outfitSlice.length === 0) return null;

  const hasValidImage = (p: Product) =>
    p.images?.[0] && (p.images[0].startsWith('http') || p.images[0].startsWith('/'));

  return (
    <div style={{
      background: 'var(--paper-soft)',
      border: '1.5px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          width: 32, height: 32,
          borderRadius: 8,
          background: 'var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 14, color: 'var(--paper)' }} />
        </div>
        <div>
          <p style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
            {isRTL ? 'أكمل إطلالتك' : 'Shop The Look'}
          </p>
          <p style={{ fontFamily: 'Cairo, sans-serif', fontSize: 11, color: 'var(--mid)' }}>
            {isRTL ? 'قطع تتناسق مع هذا المنتج' : 'Pieces that match this item'}
          </p>
        </div>
      </div>

      {/* Current Item */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--paper)',
      }}>
        <div style={{
          width: 44, height: 52,
          borderRadius: 8,
          overflow: 'hidden',
          background: '#f0f0ee',
          flexShrink: 0,
          position: 'relative',
        }}>
          {hasValidImage(product) ? (
            <Image
              src={product.images[0]}
              alt={isRTL ? product.nameAr : product.name}
              fill
              className="object-cover"
              sizes="44px"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-shirt" style={{ fontSize: 18, color: '#ccc' }} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isRTL ? product.nameAr : product.name}
          </p>
          <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo, sans-serif' }}>
            {product.price} {isRTL ? 'ج.م' : 'EGP'}
          </p>
        </div>
        <i className="fa-solid fa-circle-check" style={{ fontSize: 16, color: 'var(--ink)', flexShrink: 0 }} />
      </div>

      {/* Outfit Items */}
      <div style={{ padding: '8px 0' }}>
        {outfitSlice.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={`/product/${item.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                textDecoration: 'none',
                transition: 'background 0.15s',
                borderBottom: i < outfitSlice.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              {/* Image */}
              <div style={{
                width: 48, height: 58,
                borderRadius: 8,
                overflow: 'hidden',
                background: '#f0f0ee',
                flexShrink: 0,
                position: 'relative',
                border: '1px solid var(--border)',
              }}>
                {hasValidImage(item) ? (
                  <Image
                    src={item.images[0]}
                    alt={isRTL ? item.nameAr : item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-shirt" style={{ fontSize: 18, color: '#ccc' }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 10, fontWeight: 700,
                  color: 'var(--mid)', textTransform: 'uppercase',
                  letterSpacing: '0.08em', marginBottom: 3,
                  fontFamily: 'Cairo, sans-serif',
                }}>
                  {item.category}
                </p>
                <p style={{
                  fontSize: 13, fontWeight: 600,
                  color: 'var(--ink)', fontFamily: 'Cairo, sans-serif',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {isRTL ? item.nameAr : item.name}
                </p>
                <p style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo, sans-serif', marginTop: 2 }}>
                  {item.price} {isRTL ? 'ج.م' : 'EGP'}
                </p>
              </div>

              <i
                className={`fa-solid ${isRTL ? 'fa-arrow-left' : 'fa-arrow-right'}`}
                style={{ fontSize: 12, color: 'var(--mid)', flexShrink: 0 }}
              />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Total */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--paper)',
      }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo, sans-serif', marginBottom: 2 }}>
            {isRTL ? 'إجمالي الإطلالة' : 'Total Look'}
          </p>
          <p style={{ fontSize: 15, fontWeight: 900, color: 'var(--ink)', fontFamily: 'Cairo, sans-serif' }}>
            {product.price + outfitSlice.reduce((s, p) => s + p.price, 0)} {isRTL ? 'ج.م' : 'EGP'}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          color: 'var(--mid)',
          fontFamily: 'Cairo, sans-serif',
        }}>
          <i className="fa-solid fa-layer-group" style={{ fontSize: 12 }} />
          {1 + outfitSlice.length} {isRTL ? 'قطع' : 'pieces'}
        </div>
      </div>

    </div>
  );
}