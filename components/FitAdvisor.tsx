'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

type Props = { sizes: string[] };

export default function FitAdvisor({ sizes }: Props) {
  const { language } = useStore();
  const isRTL = language === 'ar';
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState('');

  const getSize = (h: number, w: number): string => {
    const bmi = w / ((h / 100) ** 2);
    if (h < 165) {
      if (bmi < 18.5) return 'XS';
      if (bmi < 23) return 'S';
      if (bmi < 27) return 'M';
      return 'L';
    } else if (h < 175) {
      if (bmi < 18.5) return 'S';
      if (bmi < 23) return 'M';
      if (bmi < 27) return 'L';
      return 'XL';
    } else if (h < 185) {
      if (bmi < 18.5) return 'M';
      if (bmi < 23) return 'L';
      if (bmi < 27) return 'XL';
      return 'XXL';
    } else {
      if (bmi < 23) return 'L';
      if (bmi < 27) return 'XL';
      return 'XXL';
    }
  };

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h < 100 || h > 250 || w < 30 || w > 250) {
      setResult('invalid');
      return;
    }
    const rec = getSize(h, w);
    const available = sizes.includes(rec)
      ? rec
      : sizes[Math.floor(sizes.length / 2)];
    setResult(available);
  };

  return (
    <div style={{
      background: 'var(--paper-soft)',
      border: '1.5px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>

      {/* Toggle Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 8,
            background: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fa-solid fa-ruler" style={{ fontSize: 13, color: 'var(--paper)' }} />
          </div>
          <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
            <p style={{
              fontFamily: 'Cairo, sans-serif',
              fontWeight: 700, fontSize: 13,
              color: 'var(--ink)',
            }}>
              {isRTL ? 'مساعد اختيار المقاس' : 'Find My Size'}
            </p>
            <p style={{
              fontFamily: 'Cairo, sans-serif',
              fontSize: 11, color: 'var(--mid)',
            }}>
              {isRTL ? 'أدخل طولك ووزنك' : 'Enter your height and weight'}
            </p>
          </div>
        </div>
        <motion.i
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="fa-solid fa-chevron-down"
          style={{ fontSize: 12, color: 'var(--mid)' }}
        />
      </button>

      {/* Body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '14px 16px 16px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>

              {/* Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="input-group">
                  <label className="input-label">
                    {isRTL ? 'الطول (سم)' : 'Height (cm)'}
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      value={height}
                      onChange={e => setHeight(e.target.value)}
                      placeholder={isRTL ? '175' : '175'}
                      className="input-field"
                      style={{ height: 44 }}
                    />
                    <i
                      className="fa-solid fa-arrows-up-down input-icon"
                      style={{ fontSize: 12 }}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">
                    {isRTL ? 'الوزن (كجم)' : 'Weight (kg)'}
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder={isRTL ? '70' : '70'}
                      className="input-field"
                      style={{ height: 44 }}
                    />
                    <i
                      className="fa-solid fa-weight-scale input-icon"
                      style={{ fontSize: 12 }}
                    />
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculate}
                className="btn-primary"
                style={{ width: '100%', fontSize: 13 }}
              >
                <i className="fa-solid fa-calculator" style={{ fontSize: 13 }} />
                {isRTL ? 'احسب مقاسي' : 'Calculate My Size'}
              </button>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: 'var(--paper)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 10,
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {result === 'invalid' ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: '#ef4444',
                      }}>
                        <i
                          className="fa-solid fa-circle-exclamation"
                          style={{ fontSize: 14 }}
                        />
                        <p style={{
                          fontSize: 12,
                          fontFamily: 'Cairo, sans-serif',
                        }}>
                          {isRTL
                            ? 'يرجى إدخال قيم صحيحة'
                            : 'Please enter valid values'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <p style={{
                          fontSize: 11,
                          color: 'var(--mid)',
                          fontFamily: 'Cairo, sans-serif',
                        }}>
                          {isRTL ? 'المقاس المقترح لك' : 'Recommended size for you'}
                        </p>

                        <div style={{
                          width: 56, height: 56,
                          borderRadius: 12,
                          background: 'var(--ink)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Cairo, sans-serif',
                          fontWeight: 900,
                          fontSize: 22,
                          color: 'var(--paper)',
                        }}>
                          {result}
                        </div>

                        <p style={{
                          fontSize: 11,
                          color: 'var(--mid)',
                          textAlign: 'center',
                          lineHeight: 1.6,
                          fontFamily: 'Cairo, sans-serif',
                          maxWidth: 220,
                        }}>
                          {isRTL
                            ? 'اختر مقاس أكبر للمظهر الأوفرسايز'
                            : 'Choose one size up for an oversized look'}
                        </p>

                        <button
                          onClick={() => {
                            setResult('');
                            setHeight('');
                            setWeight('');
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 11,
                            color: 'var(--mid)',
                            fontFamily: 'Cairo, sans-serif',
                          }}
                        >
                          {isRTL ? 'إعادة الحساب' : 'Recalculate'}
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}