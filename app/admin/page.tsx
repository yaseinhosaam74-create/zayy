'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp,
  getDoc, setDoc,
} from 'firebase/firestore';
import {
  signInWithPopup, GoogleAuthProvider, signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { db, auth } from '@/firebase/config';

// ══════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════
const ADMIN_EMAILS = [
  'yaseinhosaam74@gmail.com',
  'yaseinhosaam.1@gmail.com'
];
const MAX_SESSIONS = 2;
const CLOUDINARY_CLOUD_NAME = 'ddbjootzx';
const CLOUDINARY_UPLOAD_PRESET = 'zayy_products';

const CATEGORIES = [
  't-shirt', 'pants', 'hoodie', 'jacket',
  'dress', 'top', 'skirt', 'accessories', 'shoes',
];
const SIZES_MEN = ['S', 'M', 'L', 'XL', 'XXL'];
const SIZES_WOMEN = ['XS', 'S', 'M', 'L', 'XL'];

type Section = 'products' | 'settings' | 'offers';

type Product = {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: string;
  gender: 'men' | 'women';
  price: number;
  images: string[];
  sizes: string[];
  stock: Record<string, number>;
  active: boolean;
  featured: boolean;
  offer?: {
    active: boolean;
    discountedPrice: number;
    label: string;
    startDate: string;
    endDate: string;
  };
};

const emptyProduct: Omit<Product, 'id'> = {
  nameAr: '', nameEn: '',
  descriptionAr: '', descriptionEn: '',
  category: 't-shirt', gender: 'men',
  price: 0, images: [], sizes: [],
  stock: {}, active: true, featured: false,
  offer: { active: false, discountedPrice: 0, label: '', startDate: '', endDate: '' },
};

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionBlocked, setSessionBlocked] = useState(false);
  const [section, setSection] = useState<Section>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [filterGender, setFilterGender] = useState<'all' | 'men' | 'women'>('all');
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // ── SESSION SECURITY ──
  const registerSession = async (uid: string) => {
    try {
      const sessRef = doc(db, 'adminSessions', uid);
      const snap = await getDoc(sessRef);
      const now = Date.now();
      const sessions: Record<string, number> = snap.exists() ? snap.data() : {};
      const active: Record<string, number> = {};
      Object.entries(sessions).forEach(([id, ts]) => {
        if (now - (ts as number) < 86400000) active[id] = ts as number;
      });
      if (Object.keys(active).length >= MAX_SESSIONS && !active[sessionId.current]) {
        setSessionBlocked(true);
        await signOut(auth);
        return false;
      }
      active[sessionId.current] = now;
      await setDoc(sessRef, active);
      const interval = setInterval(async () => {
        const s = await getDoc(sessRef);
        const data = s.exists() ? { ...s.data() } : {};
        data[sessionId.current] = Date.now();
        await setDoc(sessRef, data);
      }, 60000);
      window.addEventListener('beforeunload', async () => {
        clearInterval(interval);
        const s = await getDoc(sessRef);
        const data = s.exists() ? { ...s.data() } : {};
        delete data[sessionId.current];
        await setDoc(sessRef, data);
      });
      return true;
    } catch { return true; }
  };

  // ── AUTH ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (u && ADMIN_EMAILS.includes(u.email || '')) {
        const ok = await registerSession(u.uid);
        if (ok) {
          setUser(u);
          loadProducts();
          loadSettings();
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (!ADMIN_EMAILS.includes(result.user.email || '')) {
        await signOut(auth);
        showToast('❌ هذا الحساب غير مصرح له');
      }
    } catch { showToast('❌ فشل تسجيل الدخول'); }
  };

  const logout = async () => {
    if (user) {
      try {
        const sessRef = doc(db, 'adminSessions', user.uid);
        const snap = await getDoc(sessRef);
        if (snap.exists()) {
          const data = { ...snap.data() };
          delete data[sessionId.current];
          await setDoc(sessRef, data);
        }
      } catch {}
    }
    await signOut(auth);
    setUser(null);
  };

  // ── DATA ──
  const loadProducts = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    } catch (e) { console.error(e); }
  };

  const loadSettings = async () => {
    try {
      const snap = await getDoc(doc(db, 'setting', 'brand'));
      if (snap.exists()) setSettings(snap.data());
    } catch (e) { console.error(e); }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'setting', 'brand'), settings, { merge: true });
      showToast('✅ تم حفظ الإعدادات بنجاح');
    } catch { showToast('❌ حدث خطأ أثناء الحفظ'); }
    setSavingSettings(false);
  };

  // ── CLOUDINARY IMAGE UPLOAD ──
  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'zayy/products');
      try {
        setUploadProgress(Math.round((i / files.length) * 100));
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );
        const data = await response.json();
        if (data.secure_url) {
          urls.push(data.secure_url);
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        } else {
          showToast('❌ فشل رفع الصورة: ' + (data.error?.message || 'خطأ'));
        }
      } catch {
        showToast('❌ فشل الاتصال بخدمة الصور');
      }
    }
    if (urls.length > 0) {
      setEditProduct(prev => ({ ...prev, images: [...(prev?.images || []), ...urls] }));
      showToast(`✅ تم رفع ${urls.length} صورة بنجاح`);
    }
    setUploading(false);
    setUploadProgress(0);
  };

  const removeImage = (url: string) => {
    setEditProduct(prev => ({ ...prev, images: prev?.images?.filter(i => i !== url) || [] }));
    showToast('تم حذف الصورة');
  };

  // ── SAVE PRODUCT ──
  const saveProduct = async () => {
    if (!editProduct?.nameAr || !editProduct?.nameEn || !editProduct?.price) {
      showToast('⚠️ يرجى ملء: الاسم عربي، الاسم إنجليزي، السعر');
      return;
    }
    setSaving(true);
    try {
      const data: any = {
        nameAr: editProduct.nameAr || '',
        nameEn: editProduct.nameEn || '',
        descriptionAr: editProduct.descriptionAr || '',
        descriptionEn: editProduct.descriptionEn || '',
        category: editProduct.category || 't-shirt',
        gender: editProduct.gender || 'men',
        price: Number(editProduct.price) || 0,
        images: editProduct.images || [],
        sizes: editProduct.sizes || [],
        stock: editProduct.stock || {},
        active: editProduct.active ?? true,
        featured: editProduct.featured ?? false,
        offer: editProduct.offer || { active: false, discountedPrice: 0, label: '', startDate: '', endDate: '' },
        updatedAt: serverTimestamp(),
      };
      if (isNewProduct) {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'products'), data);
        showToast('✅ تم إضافة المنتج بنجاح');
      } else {
        await updateDoc(doc(db, 'products', editProduct.id!), data);
        showToast('✅ تم تحديث المنتج بنجاح');
      }
      await loadProducts();
      setEditProduct(null);
    } catch (e) {
      showToast('❌ حدث خطأ: ' + String(e));
    }
    setSaving(false);
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      await loadProducts();
      setDeleteConfirm(null);
      showToast('🗑️ تم حذف المنتج');
    } catch { showToast('❌ فشل الحذف'); }
  };

  const toggleActive = async (product: Product) => {
    await updateDoc(doc(db, 'products', product.id), { active: !product.active });
    await loadProducts();
  };

  const toggleFeatured = async (product: Product) => {
    await updateDoc(doc(db, 'products', product.id), { featured: !product.featured });
    await loadProducts();
    showToast(product.featured ? 'تم إلغاء التمييز' : '⭐ تم تمييز المنتج');
  };

  const toggleSize = (size: string) => {
    const current = editProduct?.sizes || [];
    const updated = current.includes(size) ? current.filter(s => s !== size) : [...current, size];
    const stock = { ...(editProduct?.stock || {}) };
    if (!stock[size]) stock[size] = 0;
    setEditProduct(prev => ({ ...prev, sizes: updated, stock }));
  };

  const currentSizes = editProduct?.gender === 'women' ? SIZES_WOMEN : SIZES_MEN;
  const filteredProducts = products.filter(p => filterGender === 'all' ? true : p.gender === filterGender);

  // ── LOADING ──
  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', fontFamily: 'Cairo', fontSize: 52, fontWeight: 900 }}>زيّ</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Cairo', fontSize: 13, marginTop: 8 }}>جاري التحقق...</p>
      </div>
    </div>
  );

  // ── SESSION BLOCKED ──
  if (sessionBlocked) return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <i className="fa-solid fa-shield-halved" style={{ fontSize: 28, color: '#ef4444' }} />
        </div>
        <p style={{ color: '#fff', fontFamily: 'Cairo', fontSize: 20, fontWeight: 900, marginBottom: 12 }}>تم الوصول للحد الأقصى</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Cairo', fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
          لوحة التحكم مفتوحة على {MAX_SESSIONS} أجهزة. أغلق أحد الأجهزة الأخرى ثم حاول مجدداً.
        </p>
        <button onClick={() => { setSessionBlocked(false); window.location.reload(); }}
          style={{ background: '#fff', color: '#111', border: 'none', borderRadius: 10, padding: '12px 28px', fontFamily: 'Cairo', fontWeight: 700, cursor: 'pointer' }}>
          إعادة المحاولة
        </button>
      </div>
    </div>
  );

  // ── LOGIN ──
  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <div style={{ background: '#1a1a1a', border: '1.5px solid #2a2a2a', borderRadius: 20, padding: 40, width: '90%', maxWidth: 380, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 56, color: '#fff', marginBottom: 4, lineHeight: 1 }}>زيّ</p>
        <p style={{ fontFamily: 'Cairo', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', marginBottom: 48, textTransform: 'uppercase' }}>لوحة التحكم</p>
        <button onClick={login}
          style={{ width: '100%', padding: '14px 0', background: '#fff', color: '#111', border: 'none', borderRadius: 12, fontFamily: 'Cairo', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <i className="fa-brands fa-google" style={{ fontSize: 18, color: '#4285F4' }} />
          تسجيل الدخول بـ Google
        </button>
        <p style={{ fontFamily: 'Cairo', fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 20 }}>متاح فقط للحسابات المصرح لها</p>
        {toast && (
          <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontFamily: 'Cairo', fontSize: 13 }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );

  // ── MAIN UI ──
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '12px 20px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ color: '#fff', fontWeight: 900, fontSize: 22, fontFamily: 'Cairo' }}>زيّ</p>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: '0.15em' }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user.photoURL && <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #2a2a2a' }} />}
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</span>
          <button onClick={logout} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo' }}>خروج</button>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background: '#151515', borderBottom: '1px solid #2a2a2a', padding: '0 16px', display: 'flex', gap: 4, overflowX: 'auto' }}>
        {([
          { id: 'products', label: 'المنتجات', icon: 'fa-shirt' },
          { id: 'settings', label: 'الإعدادات', icon: 'fa-gear' },
          { id: 'offers', label: 'العروض', icon: 'fa-tag' },
        ] as { id: Section; label: string; icon: string }[]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            style={{ padding: '14px 16px', background: 'none', border: 'none', borderBottom: section === s.id ? '2px solid #fff' : '2px solid transparent', color: section === s.id ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            <i className={`fa-solid ${s.icon}`} style={{ fontSize: 13 }} />
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* ══ PRODUCTS ══ */}
        {section === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['all', 'men', 'women'] as const).map(g => (
                  <button key={g} onClick={() => setFilterGender(g)}
                    style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${filterGender === g ? '#fff' : '#2a2a2a'}`, background: filterGender === g ? '#fff' : 'transparent', color: filterGender === g ? '#111' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo', fontWeight: 700 }}>
                    {g === 'all' ? `الكل (${products.length})` : g === 'men' ? `رجال (${products.filter(p => p.gender === 'men').length})` : `نساء (${products.filter(p => p.gender === 'women').length})`}
                  </button>
                ))}
              </div>
              <button onClick={() => { setEditProduct({ ...emptyProduct }); setIsNewProduct(true); }}
                style={{ background: '#fff', color: '#111', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'Cairo', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-plus" />
                إضافة منتج جديد
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)' }}>
                  <i className="fa-solid fa-box-open" style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
                  <p style={{ fontFamily: 'Cairo', fontSize: 15 }}>لا توجد منتجات — ابدأ بإضافة منتجك الأول</p>
                </div>
              )}
              {filteredProducts.map(product => (
                <div key={product.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 52, height: 64, borderRadius: 8, overflow: 'hidden', background: '#2a2a2a', flexShrink: 0 }}>
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-solid fa-shirt" style={{ fontSize: 18, color: '#333' }} /></div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                      {product.gender === 'men' ? 'رجال' : 'نساء'} · {product.category}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.nameAr}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.nameEn}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 4 }}>{product.price} ج.م</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 9, padding: '3px 7px', borderRadius: 5, background: product.active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: product.active ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                      {product.active ? 'نشط' : 'مخفي'}
                    </span>
                    {product.featured && <span style={{ fontSize: 9, padding: '3px 7px', borderRadius: 5, background: 'rgba(234,179,8,0.12)', color: '#eab308', fontWeight: 700 }}>مميز</span>}
                    {product.offer?.active && <span style={{ fontSize: 9, padding: '3px 7px', borderRadius: 5, background: 'rgba(168,85,247,0.12)', color: '#a855f7', fontWeight: 700 }}>عرض</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <button onClick={() => { setEditProduct({ ...product }); setIsNewProduct(false); }}
                      style={{ width: 32, height: 32, borderRadius: 7, background: '#252525', border: '1px solid #333', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-pen" style={{ fontSize: 11 }} />
                    </button>
                    <button onClick={() => toggleActive(product)}
                      style={{ width: 32, height: 32, borderRadius: 7, background: '#252525', border: '1px solid #333', color: product.active ? '#22c55e' : '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`fa-solid ${product.active ? 'fa-eye' : 'fa-eye-slash'}`} style={{ fontSize: 11 }} />
                    </button>
                    <button onClick={() => toggleFeatured(product)}
                      style={{ width: 32, height: 32, borderRadius: 7, background: '#252525', border: '1px solid #333', color: product.featured ? '#eab308' : 'rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-star" style={{ fontSize: 11 }} />
                    </button>
                    <button onClick={() => setDeleteConfirm(product.id)}
                      style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-trash" style={{ fontSize: 11 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ SETTINGS ══ */}
        {section === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, marginBottom: 4 }}>إعدادات الموقع الكاملة</h2>

            {/* Brand */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>🏷️ هوية العلامة التجارية</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'name', label: 'اسم الموقع بالعربية' },
                  { key: 'nameEn', label: 'اسم الموقع بالإنجليزية' },
                  { key: 'taglineAr', label: 'الشعار بالعربية' },
                  { key: 'taglineEn', label: 'الشعار بالإنجليزية' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Hero */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>🏠 الصفحة الرئيسية — Hero</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'heroEyebrowAr', label: 'النص الصغير فوق العنوان (عربي)' },
                  { key: 'heroEyebrowEn', label: 'النص الصغير فوق العنوان (إنجليزي)' },
                  { key: 'heroTitleAr', label: 'العنوان الكبير (عربي)' },
                  { key: 'heroTitleEn', label: 'العنوان الكبير (إنجليزي)' },
                  { key: 'heroSubAr', label: 'النص الصغير تحت العنوان (عربي)' },
                  { key: 'heroSubEn', label: 'النص الصغير تحت العنوان (إنجليزي)' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Home Quote */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>💬 الصفحة الرئيسية — الاقتباس السفلي</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'quoteAr', label: 'نص الاقتباس بالعربية' },
                  { key: 'quoteEn', label: 'نص الاقتباس بالإنجليزية' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <textarea value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      rows={2}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* About Page */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>👤 صفحة من نحن</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'aboutAr', label: 'نص من نحن بالعربية', rows: 4 },
                  { key: 'aboutEn', label: 'نص من نحن بالإنجليزية', rows: 4 },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <textarea value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      rows={f.rows}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '16px 0 12px' }}>الأرقام والإحصائيات</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { key: 'statProducts', label: 'عدد المنتجات', placeholder: '+500' },
                  { key: 'statClients', label: 'عدد العملاء', placeholder: '+2K' },
                  { key: 'statCotton', label: 'نسبة الجودة', placeholder: '100%' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '16px 0 12px' }}>اقتباس صفحة من نحن</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'aboutQuoteAr', label: 'الاقتباس بالعربية' },
                  { key: 'aboutQuoteEn', label: 'الاقتباس بالإنجليزية' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>📞 صفحة التواصل</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'email', label: 'البريد الإلكتروني' },
                  { key: 'phone', label: 'رقم الهاتف' },
                  { key: 'whatsapp', label: 'رقم واتساب' },
                  { key: 'whatsappUrl', label: 'رابط واتساب (wa.me/...)' },
                  { key: 'instagramUrl', label: 'رابط إنستغرام' },
                  { key: 'tiktokUrl', label: 'رابط تيك توك' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>🔗 الفوتر</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'footerCopyrightAr', label: 'نص حقوق النشر بالعربية', placeholder: 'جميع الحقوق محفوظة' },
                  { key: 'footerCopyrightEn', label: 'نص حقوق النشر بالإنجليزية', placeholder: 'All rights reserved' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      placeholder={(f as any).placeholder}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>🗂️ تصنيفات المنتجات</p>
              {[
                { key: 'categoriesMen', label: 'تصنيفات قسم الرجال' },
                { key: 'categoriesWomen', label: 'تصنيفات قسم النساء' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10 }}>{f.label}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {(settings[f.key] || []).map((cat: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#252525', border: '1px solid #333', borderRadius: 8, padding: '6px 10px' }}>
                        <span style={{ fontSize: 12, color: '#fff' }}>{cat}</span>
                        <button onClick={() => { const u = [...(settings[f.key] || [])]; u.splice(idx, 1); setSettings({ ...settings, [f.key]: u }); }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: 11 }}>
                          <i className="fa-solid fa-xmark" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select id={`sel-${f.key}`}
                      style={{ flex: 1, background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, fontFamily: 'Cairo' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={() => { const el = document.getElementById(`sel-${f.key}`) as HTMLSelectElement; const val = el?.value; if (val && !(settings[f.key] || []).includes(val)) setSettings({ ...settings, [f.key]: [...(settings[f.key] || []), val] }); }}
                      style={{ background: '#fff', color: '#111', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo', fontWeight: 700 }}>
                      إضافة
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={saveSettings} disabled={savingSettings}
              style={{ background: savingSettings ? '#333' : '#fff', color: savingSettings ? 'rgba(255,255,255,0.4)' : '#111', border: 'none', borderRadius: 12, padding: '14px 0', width: '100%', fontFamily: 'Cairo', fontWeight: 900, fontSize: 15, cursor: savingSettings ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <i className="fa-solid fa-floppy-disk" />
              {savingSettings ? 'جاري الحفظ...' : 'حفظ جميع إعدادات الموقع'}
            </button>
          </div>
        )}

        {/* ══ OFFERS ══ */}
        {section === 'offers' && (
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, marginBottom: 8 }}>إدارة العروض والتخفيضات</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'Cairo', marginBottom: 20 }}>
              اضغط على ⭐ لتمييز المنتج في الصفحة الرئيسية. فعّل العرض وحدد السعر الجديد ومدة العرض.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {products.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)' }}>
                  <i className="fa-solid fa-tag" style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
                  <p style={{ fontFamily: 'Cairo', fontSize: 15 }}>أضف منتجات أولاً من قسم المنتجات</p>
                </div>
              )}
              {products.map(product => (
                <div key={product.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 54, borderRadius: 8, overflow: 'hidden', background: '#2a2a2a', flexShrink: 0 }}>
                      {product.images?.[0] && <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.nameAr}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{product.price} ج.م — {product.gender === 'men' ? 'رجال' : 'نساء'}</p>
                    </div>
                    <button onClick={() => toggleFeatured(product)}
                      style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: product.featured ? 'rgba(234,179,8,0.15)' : '#252525', color: product.featured ? '#eab308' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <i className="fa-solid fa-star" />
                      {product.featured ? 'مميز' : 'تمييز'}
                    </button>
                  </div>
                  <div style={{ background: '#111', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>تفعيل العرض:</span>
                      <button onClick={async () => { await updateDoc(doc(db, 'products', product.id), { 'offer.active': !product.offer?.active }); await loadProducts(); }}
                        style={{ padding: '4px 14px', borderRadius: 6, border: 'none', background: product.offer?.active ? 'rgba(34,197,94,0.15)' : '#252525', color: product.offer?.active ? '#22c55e' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo', fontWeight: 700 }}>
                        {product.offer?.active ? '✓ مفعّل' : 'تفعيل'}
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[
                        { label: 'السعر بعد الخصم (ج.م)', field: 'discountedPrice', type: 'number' },
                        { label: 'نص الشارة (مثال: خصم 20%)', field: 'label', type: 'text' },
                        { label: 'تاريخ البدء', field: 'startDate', type: 'datetime-local' },
                        { label: 'تاريخ الانتهاء', field: 'endDate', type: 'datetime-local' },
                      ].map(f => (
                        <div key={f.field}>
                          <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                          <input type={f.type} defaultValue={(product.offer as any)?.[f.field] || ''}
                            onBlur={async e => { await updateDoc(doc(db, 'products', product.id), { [`offer.${f.field}`]: f.type === 'number' ? Number(e.target.value) : e.target.value }); await loadProducts(); }}
                            style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 7, padding: '7px 10px', color: '#fff', fontSize: 12, boxSizing: 'border-box' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══ PRODUCT FORM MODAL ══ */}
      <AnimatePresence>
        {editProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '20px 16px' }}>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              style={{ maxWidth: 620, margin: '0 auto', background: '#1a1a1a', borderRadius: 20, border: '1px solid #2a2a2a', padding: 24 }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 900 }}>
                  {isNewProduct ? '+ إضافة منتج جديد' : '✏️ تعديل المنتج'}
                </h2>
                <button onClick={() => setEditProduct(null)}
                  style={{ background: '#252525', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Names */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>الاسم بالعربية *</label>
                    <input value={editProduct.nameAr || ''} onChange={e => setEditProduct(p => ({ ...p, nameAr: e.target.value }))}
                      placeholder="مثال: تيشيرت أوفرسايز أسود"
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>الاسم بالإنجليزية *</label>
                    <input value={editProduct.nameEn || ''} onChange={e => setEditProduct(p => ({ ...p, nameEn: e.target.value }))}
                      placeholder="e.g. Oversized Black Tee"
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Descriptions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>الوصف بالعربية</label>
                    <textarea value={editProduct.descriptionAr || ''} onChange={e => setEditProduct(p => ({ ...p, descriptionAr: e.target.value }))}
                      rows={3} placeholder="وصف المنتج بالعربية..."
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>الوصف بالإنجليزية</label>
                    <textarea value={editProduct.descriptionEn || ''} onChange={e => setEditProduct(p => ({ ...p, descriptionEn: e.target.value }))}
                      rows={3} placeholder="Product description in English..."
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Category / Gender / Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>التصنيف</label>
                    <select value={editProduct.category || 't-shirt'} onChange={e => setEditProduct(p => ({ ...p, category: e.target.value }))}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>الجنس</label>
                    <select value={editProduct.gender || 'men'} onChange={e => setEditProduct(p => ({ ...p, gender: e.target.value as 'men' | 'women', sizes: [], stock: {} }))}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo' }}>
                      <option value="men">رجال</option>
                      <option value="women">نساء</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>السعر (ج.م) *</label>
                    <input type="number" value={editProduct.price || ''} onChange={e => setEditProduct(p => ({ ...p, price: Number(e.target.value) }))}
                      placeholder="299"
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 10 }}>
                    المقاسات ({editProduct.gender === 'women' ? 'نساء' : 'رجال'})
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {currentSizes.map(size => (
                      <button key={size} onClick={() => toggleSize(size)}
                        style={{ padding: '8px 18px', borderRadius: 8, border: `1.5px solid ${editProduct.sizes?.includes(size) ? '#fff' : '#2a2a2a'}`, background: editProduct.sizes?.includes(size) ? '#fff' : 'transparent', color: editProduct.sizes?.includes(size) ? '#111' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                        {size}
                      </button>
                    ))}
                  </div>
                  {editProduct.sizes && editProduct.sizes.length > 0 && (
                    <div>
                      <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 10 }}>الكمية لكل مقاس</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {editProduct.sizes.map(size => (
                          <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{size}</label>
                            <input type="number" min="0" value={editProduct.stock?.[size] ?? 0}
                              onChange={e => setEditProduct(p => ({ ...p, stock: { ...p?.stock, [size]: Number(e.target.value) } }))}
                              style={{ width: 56, background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: 8, color: '#fff', fontSize: 13, textAlign: 'center' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Images */}
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 10 }}>
                    الصور ({editProduct.images?.length || 0} صورة)
                  </label>
                  {editProduct.images && editProduct.images.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {editProduct.images.map((img, i) => (
                        <div key={i} style={{ position: 'relative', width: 70, height: 86 }}>
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: i === 0 ? '2px solid #fff' : '1px solid #2a2a2a' }} />
                          {i === 0 && <span style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: '#fff', background: '#111', padding: '1px 5px', borderRadius: 4, whiteSpace: 'nowrap' }}>رئيسية</span>}
                          <button onClick={() => removeImage(img)}
                            style={{ position: 'absolute', top: -6, insetInlineEnd: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>
                            <i className="fa-solid fa-xmark" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="file" ref={fileRef} multiple accept="image/*" style={{ display: 'none' }}
                    onChange={e => e.target.files && uploadImages(e.target.files)} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    style={{ width: '100%', padding: '14px', borderRadius: 10, border: '2px dashed #2a2a2a', background: uploading ? 'rgba(255,255,255,0.03)' : 'transparent', color: uploading ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 20 }} />
                    {uploading ? `جاري الرفع... ${uploadProgress}%` : 'اضغط لاختيار الصور ورفعها'}
                  </button>
                  {uploading && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 5, background: '#2a2a2a', borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }}
                          style={{ height: '100%', background: '#fff', borderRadius: 3 }} />
                      </div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, fontFamily: 'Cairo' }}>
                        {uploadProgress}% — يرجى الانتظار حتى اكتمال الرفع
                      </p>
                    </div>
                  )}
                </div>

                {/* Active / Featured */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => setEditProduct(p => ({ ...p, active: !p?.active }))}
                    style={{ padding: '10px', borderRadius: 10, border: `1.5px solid ${editProduct.active ? 'rgba(34,197,94,0.35)' : '#2a2a2a'}`, background: editProduct.active ? 'rgba(34,197,94,0.08)' : 'transparent', color: editProduct.active ? '#22c55e' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <i className={`fa-solid ${editProduct.active ? 'fa-eye' : 'fa-eye-slash'}`} />
                    {editProduct.active ? 'نشط — مرئي للعملاء' : 'مخفي عن العملاء'}
                  </button>
                  <button onClick={() => setEditProduct(p => ({ ...p, featured: !p?.featured }))}
                    style={{ padding: '10px', borderRadius: 10, border: `1.5px solid ${editProduct.featured ? 'rgba(234,179,8,0.35)' : '#2a2a2a'}`, background: editProduct.featured ? 'rgba(234,179,8,0.08)' : 'transparent', color: editProduct.featured ? '#eab308' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <i className="fa-solid fa-star" />
                    {editProduct.featured ? 'مميز في الرئيسية' : 'غير مميز'}
                  </button>
                </div>

                {/* Save */}
                <button onClick={saveProduct} disabled={saving || uploading}
                  style={{ width: '100%', padding: '14px', borderRadius: 12, background: saving || uploading ? '#333' : '#fff', color: saving || uploading ? 'rgba(255,255,255,0.4)' : '#111', border: 'none', fontFamily: 'Cairo', fontWeight: 900, fontSize: 15, cursor: saving || uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <i className="fa-solid fa-floppy-disk" />
                  {saving ? 'جاري الحفظ...' : uploading ? 'انتظر اكتمال الرفع...' : isNewProduct ? 'إضافة المنتج' : 'حفظ التعديلات'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ DELETE CONFIRM ══ */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ scale: 0.88 }} animate={{ scale: 1 }} exit={{ scale: 0.88 }}
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 22, color: '#ef4444' }} />
              </div>
              <h3 style={{ color: '#fff', fontFamily: 'Cairo', fontWeight: 900, fontSize: 18, marginBottom: 10 }}>حذف المنتج نهائياً</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Cairo', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>لا يمكن التراجع عن هذا الإجراء. هل أنت متأكد؟</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => deleteProduct(deleteConfirm)}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14 }}>
                  نعم، احذف
                </button>
                <button onClick={() => setDeleteConfirm(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: 10, background: '#252525', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 700, fontSize: 14 }}>
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}