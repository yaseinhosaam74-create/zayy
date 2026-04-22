'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp,
  getDoc, setDoc, where,
} from 'firebase/firestore';
import {
  signInWithPopup, GoogleAuthProvider, signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { db, auth } from '@/firebase/config';

// ══════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════
const ADMIN_EMAILS = ['yaseinhosaam74@gmail.com'];
const ADMIN_PASSWORD = 'yyy777yyy777';
const CLOUDINARY_CLOUD_NAME = 'ddbjootzx';
const CLOUDINARY_UPLOAD_PRESET = 'zayy_products';

const CATEGORIES = ['t-shirt', 'pants', 'hoodie', 'jacket', 'dress', 'top', 'skirt', 'accessories', 'shoes'];
const SIZES_MEN = ['S', 'M', 'L', 'XL', 'XXL'];
const SIZES_WOMEN = ['XS', 'S', 'M', 'L', 'XL'];

const PRESET_COLORS = [
  { name: 'Black', nameAr: 'أسود', hex: '#1a1a1a' },
  { name: 'White', nameAr: 'أبيض', hex: '#f5f5f5' },
  { name: 'Grey', nameAr: 'رمادي', hex: '#9ca3af' },
  { name: 'Navy', nameAr: 'كحلي', hex: '#1e3a5f' },
  { name: 'Beige', nameAr: 'بيج', hex: '#d4b896' },
  { name: 'Brown', nameAr: 'بني', hex: '#92400e' },
  { name: 'Green', nameAr: 'أخضر', hex: '#166534' },
  { name: 'Red', nameAr: 'أحمر', hex: '#dc2626' },
  { name: 'Burgundy', nameAr: 'عنابي', hex: '#7f1d1d' },
  { name: 'Cream', nameAr: 'كريمي', hex: '#fef9c3' },
  { name: 'Olive', nameAr: 'زيتي', hex: '#65a30d' },
  { name: 'Camel', nameAr: 'كاميل', hex: '#c19a6b' },
];

type AdminSection = 'products' | 'settings' | 'offers' | 'logs' | 'orders' | 'customers' | 'sections' | 'restock';

type ProductColor = {
  name: string;
  nameAr: string;
  hex: string;
  images: string[];
};

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
  colors: ProductColor[];
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
  createdAt?: any;
};

const emptyProduct: Omit<Product, 'id'> = {
  nameAr: '', nameEn: '',
  descriptionAr: '', descriptionEn: '',
  category: 't-shirt', gender: 'men',
  price: 0, images: [], colors: [], sizes: [],
  stock: {}, active: true, featured: false,
  offer: { active: false, discountedPrice: 0, label: '', startDate: '', endDate: '' },
};

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [section, setSection] = useState<AdminSection>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [restockRequests, setRestockRequests] = useState<any[]>([]);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadingColorIndex, setUploadingColorIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [filterGender, setFilterGender] = useState<'all' | 'men' | 'women'>('all');
  const [toast, setToast] = useState('');
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const colorFileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const checkPassword = (): boolean => {
    const pwd = prompt('أدخل كلمة المرور للدخول:');
    if (pwd !== ADMIN_PASSWORD) {
      alert('❌ كلمة المرور غير صحيحة');
      signOut(auth);
      return false;
    }
    return true;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (u && ADMIN_EMAILS.includes(u.email || '')) {
        const ok = checkPassword();
        if (ok) {
          setUser(u);
          loadProducts();
          loadSettings();
          loadOrders();
          loadCustomers();
          loadDeletedProducts();
          loadRestockRequests();
        } else {
          await signOut(auth);
          setUser(null);
        }
      } else {
        if (u) { await signOut(auth); showToast('❌ غير مصرح'); }
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

  const logout = async () => { await signOut(auth); setUser(null); };

  // ── DATA LOADING ──
  const loadProducts = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    } catch (e) { console.error(e); }
  };

  const loadDeletedProducts = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'deletedProducts'), orderBy('deletedAt', 'desc')));
      setDeletedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const loadOrders = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const loadCustomers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const loadRestockRequests = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'restockRequests'), orderBy('createdAt', 'desc')));
      setRestockRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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

  // ── CLOUDINARY UPLOAD ──
  const uploadImages = async (files: FileList): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'zayy/products');
      try {
        setUploadProgress(Math.round((i / files.length) * 100));
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
        const data = await response.json();
        if (data.secure_url) {
          urls.push(data.secure_url);
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        }
      } catch { showToast('❌ فشل رفع الصورة'); }
    }
    return urls;
  };

  const handleMainImageUpload = async (files: FileList) => {
    setUploading(true);
    const urls = await uploadImages(files);
    if (urls.length > 0) {
      setEditProduct(prev => ({ ...prev, images: [...(prev?.images || []), ...urls] }));
      showToast(`✅ تم رفع ${urls.length} صورة`);
    }
    setUploading(false);
    setUploadProgress(0);
  };

  const handleColorImageUpload = async (files: FileList, colorIndex: number) => {
    setUploadingColorIndex(colorIndex);
    const urls = await uploadImages(files);
    if (urls.length > 0) {
      const colors = [...(editProduct?.colors || [])];
      colors[colorIndex] = { ...colors[colorIndex], images: [...(colors[colorIndex].images || []), ...urls] };
      setEditProduct(prev => ({ ...prev, colors }));
      showToast(`✅ تم رفع ${urls.length} صورة للون`);
    }
    setUploadingColorIndex(null);
    setUploadProgress(0);
  };

  const removeImage = (url: string) => {
    setEditProduct(prev => ({ ...prev, images: prev?.images?.filter(i => i !== url) || [] }));
  };

  const removeColorImage = (colorIndex: number, url: string) => {
    const colors = [...(editProduct?.colors || [])];
    colors[colorIndex] = { ...colors[colorIndex], images: colors[colorIndex].images.filter(i => i !== url) };
    setEditProduct(prev => ({ ...prev, colors }));
  };

  const addColor = (color: typeof PRESET_COLORS[0]) => {
    const existing = (editProduct?.colors || []).find(c => c.hex === color.hex);
    if (existing) { showToast('⚠️ هذا اللون مضاف بالفعل'); return; }
    const colors = [...(editProduct?.colors || []), { ...color, images: [] }];
    setEditProduct(prev => ({ ...prev, colors }));
    setActiveColorIndex(colors.length - 1);
  };

  const removeColor = (index: number) => {
    const colors = [...(editProduct?.colors || [])];
    colors.splice(index, 1);
    setEditProduct(prev => ({ ...prev, colors }));
    setActiveColorIndex(Math.max(0, index - 1));
  };

  const toggleSize = (size: string) => {
    const current = editProduct?.sizes || [];
    const updated = current.includes(size) ? current.filter(s => s !== size) : [...current, size];
    const stock = { ...(editProduct?.stock || {}) };
    if (!stock[size]) stock[size] = 0;
    setEditProduct(prev => ({ ...prev, sizes: updated, stock }));
  };

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
        colors: editProduct.colors || [],
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
    } catch (e) { showToast('❌ حدث خطأ: ' + String(e)); }
    setSaving(false);
  };

  const deleteProduct = async (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        await setDoc(doc(db, 'deletedProducts', id), {
          ...product,
          deletedAt: serverTimestamp(),
          originalId: id,
        });
      }
      await deleteDoc(doc(db, 'products', id));
      await loadProducts();
      await loadDeletedProducts();
      setDeleteConfirm(null);
      showToast('🗑️ تم حذف المنتج — يمكنك استعادته من سجل المحذوفات');
    } catch { showToast('❌ فشل الحذف'); }
  };

  const restoreProduct = async (deleted: any) => {
    try {
      const { id: deletedId, deletedAt, originalId, ...productData } = deleted;
      await addDoc(collection(db, 'products'), { ...productData, restoredAt: serverTimestamp() });
      await deleteDoc(doc(db, 'deletedProducts', deletedId));
      await loadProducts();
      await loadDeletedProducts();
      showToast('✅ تم استعادة المنتج بنجاح');
    } catch { showToast('❌ فشل الاستعادة'); }
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

  const blockCustomer = async (customerId: string, blocked: boolean) => {
    try {
      await updateDoc(doc(db, 'users', customerId), { blocked: !blocked });
      await loadCustomers();
      showToast(blocked ? '✅ تم إلغاء الحظر' : '🚫 تم حظر العميل');
    } catch { showToast('❌ فشل'); }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      await deleteDoc(doc(db, 'users', customerId));
      await loadCustomers();
      showToast('🗑️ تم حذف العميل');
    } catch { showToast('❌ فشل'); }
  };

  const exportOrdersJSON = () => {
    const data = JSON.stringify(orders, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zayy-orders-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('✅ تم تحميل ملف الطلبات');
  };

  const sendRestockEmail = async (request: any) => {
    showToast('📧 تم إرسال إشعار العودة للمخزون للعميل');
  };

  const currentSizes = editProduct?.gender === 'women' ? SIZES_WOMEN : SIZES_MEN;
  const filteredProducts = products.filter(p => filterGender === 'all' ? true : p.gender === filterGender);

  const navItems: { id: AdminSection; label: string; icon: string }[] = [
    { id: 'products', label: 'المنتجات', icon: 'fa-shirt' },
    { id: 'offers', label: 'العروض', icon: 'fa-tag' },
    { id: 'orders', label: 'الطلبات', icon: 'fa-bag-shopping' },
    { id: 'customers', label: 'العملاء', icon: 'fa-users' },
    { id: 'restock', label: 'نفاد المخزون', icon: 'fa-boxes-stacked' },
    { id: 'logs', label: 'المحذوفات', icon: 'fa-trash-can-arrow-up' },
    { id: 'sections', label: 'الأقسام', icon: 'fa-layer-group' },
    { id: 'settings', label: 'الإعدادات', icon: 'fa-gear' },
  ];

  // ── LOADING ──
  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#fff', fontFamily: 'Cairo', fontSize: 52, fontWeight: 900 }}>زيّ</p>
    </div>
  );

  // ── LOGIN ──
  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <div style={{ background: '#1a1a1a', border: '1.5px solid #2a2a2a', borderRadius: 20, padding: 40, width: '90%', maxWidth: 380, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Cairo', fontWeight: 900, fontSize: 56, color: '#fff', marginBottom: 4, lineHeight: 1 }}>زيّ</p>
        <p style={{ fontFamily: 'Cairo', fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', marginBottom: 48, textTransform: 'uppercase' }}>لوحة التحكم</p>
        <button onClick={login} style={{ width: '100%', padding: '14px 0', background: '#fff', color: '#111', border: 'none', borderRadius: 12, fontFamily: 'Cairo', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <i className="fa-brands fa-google" style={{ fontSize: 18, color: '#4285F4' }} />
          تسجيل الدخول بـ Google
        </button>
        <p style={{ fontFamily: 'Cairo', fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 20 }}>متاح فقط للحسابات المصرح لها</p>
        {toast && <div style={{ marginTop: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontFamily: 'Cairo', fontSize: 13 }}>{toast}</div>}
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
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName}</span>
          <button onClick={logout} style={{ background: '#2a2a2a', border: '1px solid #3a3a3a', color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo' }}>خروج</button>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background: '#151515', borderBottom: '1px solid #2a2a2a', padding: '0 8px', display: 'flex', gap: 2, overflowX: 'auto' }}>
        {navItems.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            style={{ padding: '12px 10px', background: 'none', border: 'none', borderBottom: section === s.id ? '2px solid #fff' : '2px solid transparent', color: section === s.id ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Cairo', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            <i className={`fa-solid ${s.icon}`} style={{ fontSize: 11 }} />
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>

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
              <button onClick={() => { setEditProduct({ ...emptyProduct }); setIsNewProduct(true); setActiveColorIndex(0); }}
                style={{ background: '#fff', color: '#111', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'Cairo', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-plus" />
                إضافة منتج جديد
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)' }}>
                  <i className="fa-solid fa-box-open" style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
                  <p style={{ fontFamily: 'Cairo', fontSize: 15 }}>لا توجد منتجات</p>
                </div>
              )}
              {filteredProducts.map(product => {
                const totalStock = Object.values(product.stock || {}).reduce((a, b) => a + b, 0);
                return (
                  <div key={product.id} style={{ background: '#1a1a1a', border: `1px solid ${totalStock === 0 ? 'rgba(239,68,68,0.3)' : '#2a2a2a'}`, borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 52, height: 64, borderRadius: 8, overflow: 'hidden', background: '#2a2a2a', flexShrink: 0 }}>
                      {product.images?.[0]
                        ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-solid fa-shirt" style={{ fontSize: 18, color: '#333' }} /></div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                        {product.gender === 'men' ? 'رجال' : 'نساء'} · {product.category}
                        {product.colors?.length > 0 && <span style={{ marginRight: 6, marginLeft: 6 }}>· {product.colors.length} ألوان</span>}
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.nameAr}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginTop: 2 }}>{product.price} ج.م</p>
                      <p style={{ fontSize: 10, color: totalStock === 0 ? '#ef4444' : totalStock < 10 ? '#eab308' : 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                        {totalStock === 0 ? '⚠️ نفد المخزون' : `المخزون: ${totalStock} قطعة`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 9, padding: '3px 7px', borderRadius: 5, background: product.active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: product.active ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                        {product.active ? 'نشط' : 'مخفي'}
                      </span>
                      {product.featured && <span style={{ fontSize: 9, padding: '3px 7px', borderRadius: 5, background: 'rgba(234,179,8,0.12)', color: '#eab308', fontWeight: 700 }}>مميز</span>}
                      {product.offer?.active && <span style={{ fontSize: 9, padding: '3px 7px', borderRadius: 5, background: 'rgba(168,85,247,0.12)', color: '#a855f7', fontWeight: 700 }}>عرض</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      <button onClick={() => { setEditProduct({ ...product }); setIsNewProduct(false); setActiveColorIndex(0); }}
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
                );
              })}
            </div>
          </div>
        )}

        {/* ══ OFFERS ══ */}
        {section === 'offers' && (
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, marginBottom: 8 }}>إدارة العروض والتخفيضات</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 20, fontFamily: 'Cairo' }}>
              فعّل العرض وحدد السعر الجديد والمدة. تأكد من ضبط التاريخ بشكل صحيح.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

        {/* ══ ORDERS ══ */}
        {section === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>الطلبات ({orders.length})</h2>
              <button onClick={exportOrdersJSON}
                style={{ background: '#fff', color: '#111', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="fa-solid fa-download" />
                تحميل JSON
              </button>
            </div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)' }}>
                <i className="fa-solid fa-bag-shopping" style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
                <p style={{ fontFamily: 'Cairo' }}>لا توجد طلبات حتى الآن</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orders.map(order => (
                  <div key={order.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Cairo' }}>{order.guestInfo?.name || 'عميل'}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Cairo' }}>{order.guestInfo?.phone}</p>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 900, color: '#fff', fontFamily: 'Cairo' }}>{order.total} ج.م</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {order.items?.map((item: any, i: number) => (
                        <span key={i} style={{ fontSize: 10, background: '#252525', border: '1px solid #333', borderRadius: 5, padding: '3px 8px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Cairo' }}>
                          {item.nameAr} — {item.size} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ CUSTOMERS ══ */}
        {section === 'customers' && (
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, marginBottom: 20 }}>العملاء المسجلون ({customers.length})</h2>
            {customers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)' }}>
                <i className="fa-solid fa-users" style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
                <p style={{ fontFamily: 'Cairo' }}>لا يوجد عملاء مسجلون حتى الآن</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {customers.map(customer => (
                  <div key={customer.id} style={{ background: '#1a1a1a', border: `1px solid ${customer.blocked ? 'rgba(239,68,68,0.3)' : '#2a2a2a'}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: '#2a2a2a', flexShrink: 0, position: 'relative' }}>
                      {customer.photo ? <img src={customer.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-solid fa-user" style={{ fontSize: 18, color: '#333' }} /></div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Cairo' }}>{customer.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Cairo' }}>{customer.email}</p>
                      {customer.blocked && <span style={{ fontSize: 10, color: '#ef4444', fontFamily: 'Cairo' }}>محظور</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`mailto:${customer.email}`}
                        style={{ width: 32, height: 32, borderRadius: 7, background: '#252525', border: '1px solid #333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <i className="fa-solid fa-envelope" style={{ fontSize: 11 }} />
                      </a>
                      <button onClick={() => blockCustomer(customer.id, customer.blocked)}
                        style={{ width: 32, height: 32, borderRadius: 7, background: '#252525', border: '1px solid #333', color: customer.blocked ? '#22c55e' : '#eab308', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`fa-solid ${customer.blocked ? 'fa-lock-open' : 'fa-ban'}`} style={{ fontSize: 11 }} />
                      </button>
                      <button onClick={() => { if (confirm('حذف هذا العميل نهائياً؟')) deleteCustomer(customer.id); }}
                        style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-trash" style={{ fontSize: 11 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ RESTOCK REQUESTS ══ */}
        {section === 'restock' && (
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, marginBottom: 8 }}>طلبات الإشعار بالعودة للمخزون</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 20, fontFamily: 'Cairo' }}>
              العملاء الذين طلبوا إشعاراً عند عودة منتج للمخزون
            </p>

            {/* Restock message template */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>رسالة الإشعار</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'restockMessageAr', label: 'نص الرسالة بالعربية', placeholder: 'مرحباً! المنتج {product} عاد للمخزون. اطلبه الآن قبل نفاده!' },
                  { key: 'restockMessageEn', label: 'نص الرسالة بالإنجليزية', placeholder: 'Hi! {product} is back in stock. Order now before it sells out!' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                    <textarea value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      rows={3} placeholder={f.placeholder}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 12, fontFamily: 'Cairo', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button onClick={saveSettings} style={{ background: '#fff', color: '#111', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 700, fontSize: 12, alignSelf: 'flex-start' }}>
                  حفظ الرسائل
                </button>
              </div>
            </div>

            {restockRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)' }}>
                <i className="fa-solid fa-boxes-stacked" style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
                <p style={{ fontFamily: 'Cairo' }}>لا توجد طلبات إشعار حتى الآن</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {restockRequests.map(req => (
                  <div key={req.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'Cairo' }}>{req.email}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'Cairo' }}>{req.productName} — {req.size}</p>
                    </div>
                    <button onClick={() => sendRestockEmail(req)}
                      style={{ padding: '6px 12px', borderRadius: 7, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', cursor: 'pointer', fontSize: 11, fontFamily: 'Cairo', fontWeight: 700 }}>
                      <i className="fa-solid fa-envelope" style={{ marginLeft: 4 }} />
                      إرسال إشعار
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ DELETED PRODUCTS LOG ══ */}
        {section === 'logs' && (
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, marginBottom: 8 }}>سجل المنتجات المحذوفة ({deletedProducts.length})</h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 20, fontFamily: 'Cairo' }}>
              يمكنك استعادة أي منتج محذوف بالضغط على زر الاستعادة
            </p>
            {deletedProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)' }}>
                <i className="fa-solid fa-trash-can" style={{ fontSize: 48, marginBottom: 16, display: 'block' }} />
                <p style={{ fontFamily: 'Cairo' }}>لا توجد منتجات محذوفة</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {deletedProducts.map(product => (
                  <div key={product.id} style={{ background: '#1a1a1a', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 52, height: 64, borderRadius: 8, overflow: 'hidden', background: '#2a2a2a', flexShrink: 0 }}>
                      {product.images?.[0] ? <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-solid fa-shirt" style={{ fontSize: 18, color: '#333' }} /></div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'Cairo' }}>{product.nameAr}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'Cairo' }}>{product.price} ج.م — {product.gender === 'men' ? 'رجال' : 'نساء'}</p>
                    </div>
                    <button onClick={() => restoreProduct(product)}
                      style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <i className="fa-solid fa-rotate-left" />
                      استعادة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ SECTIONS MANAGEMENT ══ */}
        {section === 'sections' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>إدارة الأقسام والصفحات</h2>

            {/* Site Maintenance Mode */}
            <div style={{ background: '#1a1a1a', border: `1px solid ${settings.maintenanceMode ? 'rgba(239,68,68,0.4)' : '#2a2a2a'}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: settings.maintenanceMode ? 16 : 0 }}>
                <div>
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo' }}>🔧 وضع الصيانة الكاملة</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Cairo', marginTop: 4 }}>
                    عند التفعيل يُغلق الموقع بالكامل ويظهر صفحة مخصصة للزوار
                  </p>
                </div>
                <button onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: settings.maintenanceMode ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: settings.maintenanceMode ? '#ef4444' : '#22c55e', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo', fontWeight: 700 }}>
                  {settings.maintenanceMode ? '🔴 مغلق' : '🟢 مفتوح'}
                </button>
              </div>
              {settings.maintenanceMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { key: 'maintenanceTitleAr', label: 'عنوان صفحة الصيانة بالعربية', placeholder: 'نحن نعمل على تحسين موقعنا' },
                    { key: 'maintenanceTitleEn', label: 'عنوان صفحة الصيانة بالإنجليزية', placeholder: "We're improving our site" },
                    { key: 'maintenanceTextAr', label: 'النص التفصيلي بالعربية', placeholder: 'سنعود قريباً بتجربة أفضل...' },
                    { key: 'maintenanceTextEn', label: 'النص التفصيلي بالإنجليزية', placeholder: "We'll be back soon with a better experience..." },
                    { key: 'maintenanceImageUrl', label: 'رابط صورة الخلفية (Cloudinary)', placeholder: 'https://res.cloudinary.com/...' },
                    { key: 'maintenanceInstagram', label: 'رابط انستغرام', placeholder: 'https://instagram.com/...' },
                    { key: 'maintenanceTiktok', label: 'رابط تيك توك', placeholder: 'https://tiktok.com/...' },
                    { key: 'maintenanceWhatsapp', label: 'رابط واتساب', placeholder: 'https://wa.me/...' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                      <input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section Locks */}
            {[
              { key: 'menComingSoon', msgArKey: 'menComingSoonMessageAr', msgEnKey: 'menComingSoonMessageEn', labelAr: 'قسم الرجال', icon: 'fa-person' },
              { key: 'womenComingSoon', msgArKey: 'womenComingSoonMessageAr', msgEnKey: 'womenComingSoonMessageEn', labelAr: 'قسم النساء', icon: 'fa-person-dress' },
              { key: 'offersComingSoon', msgArKey: 'offersComingSoonMessageAr', msgEnKey: 'offersComingSoonMessageEn', labelAr: 'قسم العروض', icon: 'fa-tag' },
            ].map(f => (
              <div key={f.key} style={{ background: '#1a1a1a', border: `1px solid ${settings[f.key] ? 'rgba(234,179,8,0.3)' : '#2a2a2a'}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: settings[f.key] ? 14 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: '#252525', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`fa-solid ${f.icon}`} style={{ fontSize: 14, color: '#fff' }} />
                    </div>
                    <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'Cairo' }}>{f.labelAr}</p>
                  </div>
                  <button onClick={() => setSettings({ ...settings, [f.key]: !settings[f.key] })}
                    style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: settings[f.key] ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: settings[f.key] ? '#ef4444' : '#22c55e', cursor: 'pointer', fontSize: 11, fontFamily: 'Cairo', fontWeight: 700 }}>
                    {settings[f.key] ? '🔒 مغلق' : '✓ مفتوح'}
                  </button>
                </div>
                {settings[f.key] && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 4 }}>رسالة بالعربية</label>
                      <input value={settings[f.msgArKey] || ''} onChange={e => setSettings({ ...settings, [f.msgArKey]: e.target.value })}
                        placeholder="قريباً..."
                        style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 7, padding: '7px 10px', color: '#fff', fontSize: 12, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 4 }}>رسالة بالإنجليزية</label>
                      <input value={settings[f.msgEnKey] || ''} onChange={e => setSettings({ ...settings, [f.msgEnKey]: e.target.value })}
                        placeholder="Coming Soon..."
                        style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 7, padding: '7px 10px', color: '#fff', fontSize: 12, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button onClick={saveSettings} disabled={savingSettings}
              style={{ background: savingSettings ? '#333' : '#fff', color: savingSettings ? 'rgba(255,255,255,0.4)' : '#111', border: 'none', borderRadius: 12, padding: '14px 0', width: '100%', fontFamily: 'Cairo', fontWeight: 900, fontSize: 15, cursor: savingSettings ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <i className="fa-solid fa-floppy-disk" />
              {savingSettings ? 'جاري الحفظ...' : 'حفظ إعدادات الأقسام'}
            </button>
          </div>
        )}

        {/* ══ SETTINGS ══ */}
        {section === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, marginBottom: 4 }}>إعدادات الموقع</h2>

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
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>🏠 الصفحة الرئيسية</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'heroEyebrowAr', label: 'النص الصغير فوق العنوان (عربي)' },
                  { key: 'heroEyebrowEn', label: 'النص الصغير فوق العنوان (إنجليزي)' },
                  { key: 'heroTitleAr', label: 'العنوان الكبير (عربي)' },
                  { key: 'heroTitleEn', label: 'العنوان الكبير (إنجليزي)' },
                  { key: 'heroSubAr', label: 'النص الصغير تحت العنوان (عربي)' },
                  { key: 'heroSubEn', label: 'النص الصغير تحت العنوان (إنجليزي)' },
                  { key: 'quoteAr', label: 'الاقتباس بالعربية' },
                  { key: 'quoteEn', label: 'الاقتباس بالإنجليزية' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>👤 صفحة من نحن</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'aboutAr', label: 'نص من نحن بالعربية', rows: 4 },
                  { key: 'aboutEn', label: 'نص من نحن بالإنجليزية', rows: 4 },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <textarea value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                      rows={f.rows} style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { key: 'statProducts', label: 'عدد المنتجات', placeholder: '+500' },
                    { key: 'statClients', label: 'عدد العملاء', placeholder: '+2K' },
                    { key: 'statCotton', label: 'نسبة الجودة', placeholder: '100%' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                      <input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                        placeholder={(f as any).placeholder}
                        style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                {[
                  { key: 'aboutQuoteAr', label: 'اقتباس صفحة من نحن بالعربية' },
                  { key: 'aboutQuoteEn', label: 'اقتباس صفحة من نحن بالإنجليزية' },
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
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>📞 التواصل والروابط</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { key: 'email', label: 'البريد الإلكتروني' },
                  { key: 'phone', label: 'رقم الهاتف' },
                  { key: 'whatsapp', label: 'رقم واتساب' },
                  { key: 'whatsappUrl', label: 'رابط واتساب (wa.me/...)' },
                  { key: 'instagramUrl', label: 'رابط إنستغرام' },
                  { key: 'tiktokUrl', label: 'رابط تيك توك' },
                  { key: 'footerCopyrightAr', label: 'نص حقوق النشر بالعربية' },
                  { key: 'footerCopyrightEn', label: 'نص حقوق النشر بالإنجليزية' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
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

            {/* Privacy & Terms */}
            {['privacy', 'terms'].map(page => (
              <div key={page} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 }}>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                  {page === 'privacy' ? '🔒 صفحة سياسة الخصوصية' : '📋 صفحة الشروط والأحكام'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { key: `${page}TitleAr`, label: 'عنوان الصفحة بالعربية' },
                    { key: `${page}TitleEn`, label: 'عنوان الصفحة بالإنجليزية' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                      <input value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                        style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} style={{ background: '#111', borderRadius: 10, padding: 12 }}>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 8, fontFamily: 'Cairo' }}>القسم {n}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                          { key: `${page}S${n}TitleAr`, label: 'عنوان بالعربية' },
                          { key: `${page}S${n}TitleEn`, label: 'عنوان بالإنجليزية' },
                          { key: `${page}S${n}TextAr`, label: 'نص بالعربية' },
                          { key: `${page}S${n}TextEn`, label: 'نص بالإنجليزية' },
                        ].map(f => (
                          <div key={f.key}>
                            <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', display: 'block', marginBottom: 3 }}>{f.label}</label>
                            <textarea value={settings[f.key] || ''} onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                              rows={2}
                              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 7, padding: '7px 10px', color: '#fff', fontSize: 11, fontFamily: 'Cairo', resize: 'vertical', boxSizing: 'border-box' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={saveSettings} disabled={savingSettings}
              style={{ background: savingSettings ? '#333' : '#fff', color: savingSettings ? 'rgba(255,255,255,0.4)' : '#111', border: 'none', borderRadius: 12, padding: '14px 0', width: '100%', fontFamily: 'Cairo', fontWeight: 900, fontSize: 15, cursor: savingSettings ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <i className="fa-solid fa-floppy-disk" />
              {savingSettings ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}
            </button>
          </div>
        )}

      </div>

      {/* ══ PRODUCT FORM MODAL ══ */}
      <AnimatePresence>
        {editProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '20px 16px' }}>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
              style={{ maxWidth: 680, margin: '0 auto', background: '#1a1a1a', borderRadius: 20, border: '1px solid #2a2a2a', padding: 24 }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 900 }}>
                  {isNewProduct ? '+ إضافة منتج جديد' : '✏️ تعديل المنتج'}
                </h2>
                <button onClick={() => setEditProduct(null)}
                  style={{ background: '#252525', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Names */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>الاسم بالعربية *</label>
                    <input value={editProduct.nameAr || ''} onChange={e => setEditProduct(p => ({ ...p, nameAr: e.target.value }))}
                      placeholder="تيشيرت أوفرسايز"
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>الاسم بالإنجليزية *</label>
                    <input value={editProduct.nameEn || ''} onChange={e => setEditProduct(p => ({ ...p, nameEn: e.target.value }))}
                      placeholder="Oversized T-Shirt"
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Descriptions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>الوصف بالعربية</label>
                    <textarea value={editProduct.descriptionAr || ''} onChange={e => setEditProduct(p => ({ ...p, descriptionAr: e.target.value }))}
                      rows={3} style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 6 }}>الوصف بالإنجليزية</label>
                    <textarea value={editProduct.descriptionEn || ''} onChange={e => setEditProduct(p => ({ ...p, descriptionEn: e.target.value }))}
                      rows={3} style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13, fontFamily: 'Cairo', resize: 'vertical', boxSizing: 'border-box' }} />
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

                {/* Sizes & Stock */}
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 10 }}>المقاسات والكميات</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    {currentSizes.map(size => (
                      <button key={size} onClick={() => toggleSize(size)}
                        style={{ padding: '8px 18px', borderRadius: 8, border: `1.5px solid ${editProduct.sizes?.includes(size) ? '#fff' : '#2a2a2a'}`, background: editProduct.sizes?.includes(size) ? '#fff' : 'transparent', color: editProduct.sizes?.includes(size) ? '#111' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                        {size}
                      </button>
                    ))}
                  </div>
                  {editProduct.sizes && editProduct.sizes.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {editProduct.sizes.map(size => (
                        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{size}</label>
                          <input type="number" min="0" value={editProduct.stock?.[size] ?? 0}
                            onChange={e => setEditProduct(p => ({ ...p, stock: { ...p?.stock, [size]: Number(e.target.value) } }))}
                            style={{ width: 56, background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: 8, color: '#fff', fontSize: 13, textAlign: 'center' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Images */}
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 10 }}>
                    الصور الرئيسية ({editProduct.images?.length || 0} صورة)
                  </label>
                  {editProduct.images && editProduct.images.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {editProduct.images.map((img, i) => (
                        <div key={i} style={{ position: 'relative', width: 64, height: 78 }}>
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 7, border: i === 0 ? '2px solid #fff' : '1px solid #2a2a2a' }} />
                          <button onClick={() => removeImage(img)}
                            style={{ position: 'absolute', top: -6, insetInlineEnd: -6, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>
                            <i className="fa-solid fa-xmark" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="file" ref={fileRef} multiple accept="image/*" style={{ display: 'none' }}
                    onChange={e => e.target.files && handleMainImageUpload(e.target.files)} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    style={{ width: '100%', padding: '12px', borderRadius: 10, border: '2px dashed #2a2a2a', background: 'transparent', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 18 }} />
                    {uploading && uploadingColorIndex === null ? `جاري الرفع... ${uploadProgress}%` : 'رفع الصور الرئيسية'}
                  </button>
                </div>

                {/* ── COLORS SECTION ── */}
                <div style={{ background: '#111', borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>
                    🎨 ألوان المنتج — كل لون له مجموعة صور خاصة
                  </p>

                  {/* Color Picker */}
                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 10, fontFamily: 'Cairo' }}>اختر لوناً لإضافته:</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {PRESET_COLORS.map(color => (
                        <button key={color.hex} onClick={() => addColor(color)} title={color.nameAr}
                          style={{
                            width: 32, height: 32, borderRadius: '50%', background: color.hex,
                            border: (editProduct.colors || []).find(c => c.hex === color.hex)
                              ? '3px solid #fff' : '2px solid #333',
                            cursor: 'pointer', padding: 0,
                            boxShadow: (editProduct.colors || []).find(c => c.hex === color.hex)
                              ? '0 0 0 2px #0f0f0f, 0 0 0 4px #fff' : 'none',
                          }} />
                      ))}
                    </div>
                  </div>

                  {/* Added Colors */}
                  {(editProduct.colors || []).length > 0 && (
                    <div>
                      {/* Color Tabs */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                        {(editProduct.colors || []).map((color, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button onClick={() => setActiveColorIndex(i)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 12px', borderRadius: 8,
                                border: `1.5px solid ${activeColorIndex === i ? '#fff' : '#2a2a2a'}`,
                                background: activeColorIndex === i ? '#252525' : 'transparent',
                                cursor: 'pointer', color: '#fff',
                              }}>
                              <div style={{ width: 14, height: 14, borderRadius: '50%', background: color.hex, border: '1px solid #444' }} />
                              <span style={{ fontSize: 11, fontFamily: 'Cairo', color: activeColorIndex === i ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                                {color.nameAr}
                              </span>
                              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>({color.images?.length || 0})</span>
                            </button>
                            <button onClick={() => removeColor(i)}
                              style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(239,68,68,0.2)', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>
                              <i className="fa-solid fa-xmark" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Active Color Images */}
                      {(editProduct.colors || [])[activeColorIndex] && (
                        <div style={{ background: '#1a1a1a', borderRadius: 10, padding: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: (editProduct.colors || [])[activeColorIndex]?.hex, border: '1px solid #444', flexShrink: 0 }} />
                            <p style={{ fontSize: 12, color: '#fff', fontFamily: 'Cairo', fontWeight: 700 }}>
                              صور اللون: {(editProduct.colors || [])[activeColorIndex]?.nameAr}
                              <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginRight: 6 }}>
                                ({(editProduct.colors || [])[activeColorIndex]?.images?.length || 0} صورة)
                              </span>
                            </p>
                          </div>

                          {(editProduct.colors || [])[activeColorIndex]?.images?.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                              {(editProduct.colors || [])[activeColorIndex].images.map((img, i) => (
                                <div key={i} style={{ position: 'relative', width: 60, height: 74 }}>
                                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: i === 0 ? '2px solid #fff' : '1px solid #2a2a2a' }} />
                                  <button onClick={() => removeColorImage(activeColorIndex, img)}
                                    style={{ position: 'absolute', top: -5, insetInlineEnd: -5, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>
                                    <i className="fa-solid fa-xmark" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <input type="file" ref={colorFileRef} multiple accept="image/*" style={{ display: 'none' }}
                            onChange={e => e.target.files && handleColorImageUpload(e.target.files, activeColorIndex)} />
                          <button onClick={() => colorFileRef.current?.click()} disabled={uploadingColorIndex !== null}
                            style={{ width: '100%', padding: '10px', borderRadius: 8, border: '2px dashed #2a2a2a', background: 'transparent', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <i className="fa-solid fa-image" />
                            {uploadingColorIndex === activeColorIndex ? `جاري الرفع... ${uploadProgress}%` : 'رفع صور هذا اللون'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {(editProduct.colors || []).length === 0 && (
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'Cairo', textAlign: 'center', padding: '16px 0' }}>
                      اختر ألواناً من القائمة أعلاه لإضافة صور لكل لون
                    </p>
                  )}
                </div>

                {/* Active / Featured */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button onClick={() => setEditProduct(p => ({ ...p, active: !p?.active }))}
                    style={{ padding: '10px', borderRadius: 10, border: `1.5px solid ${editProduct.active ? 'rgba(34,197,94,0.35)' : '#2a2a2a'}`, background: editProduct.active ? 'rgba(34,197,94,0.08)' : 'transparent', color: editProduct.active ? '#22c55e' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <i className={`fa-solid ${editProduct.active ? 'fa-eye' : 'fa-eye-slash'}`} />
                    {editProduct.active ? 'نشط' : 'مخفي'}
                  </button>
                  <button onClick={() => setEditProduct(p => ({ ...p, featured: !p?.featured }))}
                    style={{ padding: '10px', borderRadius: 10, border: `1.5px solid ${editProduct.featured ? 'rgba(234,179,8,0.35)' : '#2a2a2a'}`, background: editProduct.featured ? 'rgba(234,179,8,0.08)' : 'transparent', color: editProduct.featured ? '#eab308' : 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <i className="fa-solid fa-star" />
                    {editProduct.featured ? 'مميز' : 'غير مميز'}
                  </button>
                </div>

                {/* Save */}
                <button onClick={saveProduct} disabled={saving || uploading || uploadingColorIndex !== null}
                  style={{ width: '100%', padding: '14px', borderRadius: 12, background: saving ? '#333' : '#fff', color: saving ? 'rgba(255,255,255,0.4)' : '#111', border: 'none', fontFamily: 'Cairo', fontWeight: 900, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <i className="fa-solid fa-floppy-disk" />
                  {saving ? 'جاري الحفظ...' : isNewProduct ? 'إضافة المنتج' : 'حفظ التعديلات'}
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
              <h3 style={{ color: '#fff', fontFamily: 'Cairo', fontWeight: 900, fontSize: 18, marginBottom: 10 }}>حذف المنتج</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Cairo', fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
                سيُحفظ المنتج في سجل المحذوفات ويمكن استعادته لاحقاً
              </p>
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