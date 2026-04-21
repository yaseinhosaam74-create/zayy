'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  images: string[];
  alt: string;
};

export default function ImageZoom({ images, alt }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [lightbox, setLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const hasImage = (url: string) =>
    url && (url.startsWith('http') || url.startsWith('/'));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightbox(true);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Main Image */}
        <div
          style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: 'var(--paper-soft)', aspectRatio: '3/4', cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => openLightbox(activeIndex)}
        >
          {hasImage(images[activeIndex]) ? (
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                transformOrigin: zoomed ? `${zoomPos.x}% ${zoomPos.y}%` : 'center center',
                transition: 'transform 0.2s ease',
                transform: zoomed ? 'scale(1.8)' : 'scale(1)',
              }}
            >
              <Image
                src={images[activeIndex]}
                alt={alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0ee' }}>
              <i className="fa-solid fa-shirt" style={{ fontSize: 64, color: '#c8c8c4' }} />
            </div>
          )}

          {/* Zoom hint */}
          {!zoomed && images.length > 0 && (
            <div style={{ position: 'absolute', bottom: 12, insetInlineEnd: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="fa-solid fa-magnifying-glass-plus" style={{ fontSize: 11, color: '#fff' }} />
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {images.map((img, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.92 }}
                onClick={() => { setActiveIndex(i); setZoomed(false); }}
                style={{
                  width: 64, height: 72, borderRadius: 10, overflow: 'hidden',
                  border: `2px solid ${activeIndex === i ? 'var(--ink)' : 'var(--border)'}`,
                  background: 'var(--paper-soft)', cursor: 'pointer', padding: 0,
                  position: 'relative', transition: 'border-color 0.2s',
                }}
              >
                {hasImage(img) && (
                  <Image src={img} alt={`view ${i + 1}`} fill className="object-cover" sizes="64px" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setLightbox(false)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              style={{
                position: 'relative',
                width: '100%', maxWidth: 500,
                aspectRatio: '3/4',
              }}
              onClick={e => e.stopPropagation()}
            >
              {hasImage(images[lightboxIndex]) && (
                <Image
                  src={images[lightboxIndex]}
                  alt={alt}
                  fill
                  className="object-contain"
                  sizes="500px"
                />
              )}
            </motion.div>

            {/* Close */}
            <button
              onClick={() => setLightbox(false)}
              style={{
                position: 'fixed', top: 20, insetInlineEnd: 20,
                width: 40, height: 40, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', border: 'none',
                color: '#fff', cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + images.length) % images.length); }}
                  style={{
                    position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)',
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)', border: 'none',
                    color: '#fff', cursor: 'pointer', fontSize: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % images.length); }}
                  style={{
                    position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)',
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)', border: 'none',
                    color: '#fff', cursor: 'pointer', fontSize: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </>
            )}

            {/* Counter */}
            <div style={{
              position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Cairo',
            }}>
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}