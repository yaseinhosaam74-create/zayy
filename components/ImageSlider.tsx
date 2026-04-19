'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type ImageSliderProps = {
  images: string[];
  alt: string;
};

export default function ImageSlider({ images, alt }: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const prev = () => {
    const index = current === 0 ? images.length - 1 : current - 1;
    setDirection(-1);
    setCurrent(index);
  };

  const next = () => {
    const index = current === images.length - 1 ? 0 : current + 1;
    setDirection(1);
    setCurrent(index);
  };

  return (
    <div className="flex flex-col gap-3">

      {/* Main Image */}
      <div className="relative aspect-[3/4] bg-ink/5 rounded-sm overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[current]}
              alt={`${alt} ${current + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute start-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-paper/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-paper transition-all"
            >
              <i className="fa-solid fa-chevron-left text-xs text-ink" />
            </button>
            <button
              onClick={next}
              className="absolute end-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-paper/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-paper transition-all"
            >
              <i className="fa-solid fa-chevron-right text-xs text-ink" />
            </button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-4 h-1.5 bg-paper'
                    : 'w-1.5 h-1.5 bg-paper/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative w-20 aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                i === current
                  ? 'border-ink'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}