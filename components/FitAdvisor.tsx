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
  const [showGuide, setShowGuide] = useState(false);

  const sizeGuide = [
    { size: 'XS', chest: '80-85', waist: '60-65', hip: '85-90' },
    { size: 'S', chest: '86-91', waist: '66-71', hip: '91-96' },
    { size: 'M', chest: '92-97', waist: '72-77', hip: '97-102' },
    { size: 'L', chest: '98-103', waist: '78-83', hip: '103-108' },
    { size: 'XL', chest: '104-109', waist: '84-89', hip: '109-114' },
    { size: 'XXL', chest: '110-116', waist: '90-96', hip: '115-121' },
  ];

  const getSize = (h: number, w: number): string => {
    const bmi = w / ((h / 100) ** 2);
    if (h < 165) {
      if (bmi < 18.5) return 'XS';
      if (bmi < 22) return 'S';
      if (bmi < 26) return 'M';
      return 'L';
    } else if (h < 175) {
      if (bmi < 18.5) return 'S';
      if (bmi < 22) return 'M';
      if (bmi < 26) return 'L';
      return 'XL';
    } else if (h < 185) {
      if (bmi < 18.5) return 'M';
      if (bmi < 22) return 'L';
      if (bmi < 26) return 'XL';
      return 'XXL';
    } else {
      if (bmi < 22) return 'L';
      if (bmi < 26) return 'XL';
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
      : sizes.find(s => {
          const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
          const recIdx = order.indexOf(rec);
          return order.indexOf(s) >= recIdx;
        }) || sizes[sizes.length - 1];
    setResult(available);
  };

  return (
    <div style={{
      background: 'var(--paper-soft)',
      border: '1.5px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>

      {/* Header Toggle */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: 'none',
          border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="fa-solid fa-ruler" style={{ fontSize: 14, color: 'var(--paper)' }} />
          </div>
          <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
            <p style={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
              {isRTL ? 'مساعد اختيار المقاس' : 'Find My Size'}
            </p>
            <p style={{ fontFamily: 'Cairo', fontSize: 11, color: 'var(--mid)' }}>
              {isRTL ? 'أدخل طولك ووزنك للحصول على مقاسك' : 'Enter height & weight for your perfect size'}
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
              display: 'flex', flexDirection: 'column', gap: 14,
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
                    <i className="fa-solid fa-arrows-up-down input-icon" style={{ fontSize: 12 }} />
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
                    <i className="fa-solid fa-weight-scale input-icon" style={{ fontSize: 12 }} />
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={calculate}
                className="btn-primary"
                style={{ width: '100%', fontSize: 13 }}
              >
                <i className="fa-solid fa-calculator" style={{ fontSize: 13 }} />
                {isRTL ? 'احسب مقاسي' : 'Calculate My Size'}
              </motion.button>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      background: 'var(--paper)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 12, padding: '16px',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 10,
                    }}
                  >
                    {result === 'invalid' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444' }}>
                        <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 14 }} />
                        <p style={{ fontSize: 12, fontFamily: 'Cairo' }}>
                          {isRTL ? 'يرجى إدخال قيم صحيحة' : 'Please enter valid values'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <p style={{ fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo' }}>
                          {isRTL ? 'المقاس المقترح لك' : 'Recommended size for you'}
                        </p>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          style={{
                            width: 64, height: 64, borderRadius: 14,
                            background: 'var(--ink)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Cairo', fontWeight: 900, fontSize: 24,
                            color: 'var(--paper)',
                          }}
                        >
                          {result}
                        </motion.div>
                        <p style={{ fontSize: 11, color: 'var(--mid)', textAlign: 'center', lineHeight: 1.6, fontFamily: 'Cairo', maxWidth: 220 }}>
                          {isRTL
                            ? 'اختر مقاس أكبر للمظهر الأوفرسايز'
                            : 'Choose one size up for an oversized look'}
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => { setResult(''); setHeight(''); setWeight(''); }}
                            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: 'var(--mid)', fontFamily: 'Cairo', padding: '6px 12px' }}
                          >
                            {isRTL ? 'إعادة الحساب' : 'Recalculate'}
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Size Guide Toggle */}
              <button
                onClick={() => setShowGuide(!showGuide)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--mid)', fontSize: 12, fontFamily: 'Cairo',
                  padding: 0,
                }}
              >
                <i className="fa-solid fa-table" style={{ fontSize: 11 }} />
                {isRTL ? 'جدول المقاسات' : 'Size Guide'}
                <i className={`fa-solid ${showGuide ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: 10 }} />
              </button>

              {/* Size Guide Table */}
              <AnimatePresence>
                {showGuide && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'Cairo' }}>
                        <thead>
                          <tr style={{ background: 'var(--ink)' }}>
                            {['Size', 'Chest (cm)', 'Waist (cm)', 'Hip (cm)'].map(h => (
                              <th key={h} style={{ padding: '8px 10px', color: 'var(--paper)', fontWeight: 700, textAlign: 'center' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sizeGuide.map((row, i) => (
                            <tr key={row.size} style={{ background: i % 2 === 0 ? 'var(--paper)' : 'var(--paper-soft)' }}>
                              <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}>{row.size}</td>
                              <td style={{ padding: '8px 10px', color: 'var(--mid)', textAlign: 'center' }}>{row.chest}</td>
                              <td style={{ padding: '8px 10px', color: 'var(--mid)', textAlign: 'center' }}>{row.waist}</td>
                              <td style={{ padding: '8px 10px', color: 'var(--mid)', textAlign: 'center' }}>{row.hip}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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