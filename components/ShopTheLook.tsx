'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { getAllProducts, getActiveDiscountedPrice, type Product } from '@/lib/firebase-store';
import toast from 'react-hot-toast';

type Props = { product: Product };

export default function ShopTheLook({ product }: Props) {
  const { language, addToCart } = useStore();
  const isRTL = language === 'ar';
  const [outfit, setOutfit] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const all = await getAllProducts();
      const categoryMap: Record<string, string[]> = {
        't-shirt': ['pants', 'jacket'],
        'pants': ['t-shirt', 'hoodie'],
        'hoodie': ['pants', 't-shirt'],
        'jacket': ['pants', 't-shirt'],
        'dress': ['jacket', 'accessories'],
        'top': ['pants', 'skirt'],
        'skirt': ['top', 'jacket'],
        'all': ['pants', 't-shirt', 'hoodie'],
      };
      const complementary = categoryMap[product.category] || ['pants', 't-shirt'];
      const sameGender = all.filter(p => p.gender === product.gender && p.id !== product.id);
      const result: Product[] = [];
      complementary.forEach(cat => {
        const found = sameGender.find(p => p.category === cat && !result.find(o => o.id === p.id));
        if (found) result.push(found);
      });
      setOutfit(result.slice(0, 3));
      setLoading(false);
    };
    load();
  }, [product]);

  const hasImage = (p: Product) =>
    p.images?.[0] && (p.images[0].startsWith('http') || p.images[0].startsWith('/'));

  const totalPrice = product.price + outfit.reduce((s, p) => {
    const disc = getActiveDiscountedPrice(p);
    return s + (disc || p.price);
  }, 0);

  const handleAddAll = () => {
    outfit.forEach(item => {
      if (item.sizes?.length > 0) {
        addToCart(item as any, item.sizes[0]);
      }
    });
    addToCart(product as any, product.sizes?.[0] || '');
    const ids = outfit.map(o => o.id);
    setAddedIds(ids);
    toast.success(isRTL ? 'تمت إضافة الإطلالة كاملة للسلة' : 'Full look added to cart');
    setTimeout(() => setAddedIds([]), 2500);
  };

  if (loading || outfit.length === 0) return null;

  return (
    <div style={{
      background: 'var(--paper-soft)',
      border: '1.5px solid var(--border)',
      borderRadius: 14, overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 14, color: 'var(--paper)' }} />
        </div>
        <div>
          <p style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
            {isRTL ? 'أكمل إطلالتك' : 'Complete Your Look'}
          </p>
          <p style={{ fontFamily: 'Cairo', fontSize: 11, color: 'var(--mid)' }}>
            {isRTL ? 'قطع تتناسق مع هذا المنتج' : 'Pieces that match this item'}
          </p>
        </div>
      </div>

      {/* Current Item */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--paper)',
      }}>
        <div style={{
          width: 48, height: 58, borderRadius: 8,
          overflow: 'hidden', background: '#f0f0ee',
          flexShrink: 0, position: 'relative',
          border: '2px solid var(--ink)',
        }}>
          {hasImage(product) ? (
            <Image src={product.images[0]} alt="" fill className="object-cover" sizes="48px" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-shirt" style={{ fontSize: 18, color: '#ccc' }} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo', marginBottom: 2 }}>
            {isRTL ? 'المنتج الحالي' : 'Current item'}
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isRTL ? product.nameAr : product.nameEn}
          </p>
          <p style={{ fontSize: 12, color: 'var(--mid)', fontFamily: 'Cairo' }}>
            {product.price} {isRTL ? 'ج.م' : 'EGP'}
          </p>
        </div>
        <i className="fa-solid fa-circle-check" style={{ fontSize: 18, color: '#22c55e', flexShrink: 0 }} />
      </div>

      {/* Outfit Items */}
      {outfit.map((item, i) => {
        const disc = getActiveDiscountedPrice(item);
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ borderBottom: i < outfit.length - 1 ? '1px solid var(--border)' : 'none' }}
          >
            <Link href={`/product/${item.id}`} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', textDecoration: 'none',
            }}>
              <div style={{
                width: 48, height: 58, borderRadius: 8,
                overflow: 'hidden', background: '#f0f0ee',
                flexShrink: 0, position: 'relative',
                border: '1px solid var(--border)',
              }}>
                {hasImage(item) ? (
                  <Image src={item.images[0]} alt="" fill className="object-cover" sizes="48px" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-shirt" style={{ fontSize: 18, color: '#ccc' }} />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3, fontFamily: 'Cairo' }}>
                  {item.category}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Cairo', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isRTL ? item.nameAr : item.nameEn}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Cairo' }}>
                    {disc || item.price} {isRTL ? 'ج.م' : 'EGP'}
                  </p>
                  {disc && (
                    <p style={{ fontSize: 11, color: 'var(--mid)', textDecoration: 'line-through', fontFamily: 'Cairo' }}>
                      {item.price}
                    </p>
                  )}
                </div>
              </div>
              <i className={`fa-solid ${isRTL ? 'fa-arrow-left' : 'fa-arrow-right'}`}
                style={{ fontSize: 12, color: 'var(--mid)', flexShrink: 0 }} />
            </Link>
          </motion.div>
        );
      })}

      {/* Footer — Total + Add All */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--paper)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo', marginBottom: 2 }}>
            {isRTL ? `إجمالي الإطلالة (${1 + outfit.length} قطع)` : `Total look (${1 + outfit.length} pieces)`}
          </p>
          <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)', fontFamily: 'Cairo' }}>
            {totalPrice} {isRTL ? 'ج.م' : 'EGP'}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAddAll}
          style={{
            background: 'var(--ink)', color: 'var(--paper)',
            border: 'none', borderRadius: 10,
            padding: '10px 16px', cursor: 'pointer',
            fontFamily: 'Cairo', fontWeight: 700, fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 6,
            flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-bag-shopping" style={{ fontSize: 12 }} />
          {isRTL ? 'أضف الكل للسلة' : 'Add All to Cart'}
        </motion.button>
      </div>

    </div>
  );
}