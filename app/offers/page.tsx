'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Drawer from '@/components/Drawer';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts, getOffers } from '@/lib/firebase-store';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

export default function OffersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { language } = useStore();
  const isRTL = language === 'ar';
  const products = getFeaturedProducts();
  const offers = getOffers();

  return (
    <div className="min-h-screen bg-paper">
      <Header onMenuOpen={() => setDrawerOpen(true)} />
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Page Header */}
      <section className="bg-ink text-paper pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-paper/40 text-xs tracking-widest uppercase mb-3"
          >
            {isRTL ? 'تخفيضات حصرية' : 'Exclusive Deals'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-cairo font-bold text-5xl"
          >
            {isRTL ? 'العروض' : 'OFFERS'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-paper/40 text-sm mt-3"
          >
            {isRTL
              ? `العروض سارية حتى ${offers.expires}`
              : `Offers valid until ${offers.expires}`}
          </motion.p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-xs text-ink/40 mb-8">
          {products.length} {isRTL ? 'منتج مميز' : 'featured products'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}