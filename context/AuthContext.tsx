'use client';

import {
  createContext, useContext, useEffect, useState, ReactNode,
} from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import toast from 'react-hot-toast';

type UserData = {
  uid: string;
  name: string;
  email: string;
  photo: string;
  points: number;
  wishlist: string[];
  createdAt: unknown;
  blocked?: boolean;
};

type AuthContextType = {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithPhone: (phone: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserData(firebaseUser.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setUserData(snap.data() as UserData);
    } catch (e) { console.error(e); }
  };

  const createUserDoc = async (u: User, name: string) => {
    const ref = doc(db, 'users', u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: u.uid, name,
        email: u.email || '',
        photo: u.photoURL || '',
        points: 0, wishlist: [],
        createdAt: serverTimestamp(),
        blocked: false,
      });
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('أهلاً بك!');
    } catch {
      toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      throw new Error('login failed');
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      await createUserDoc(result.user, name);
      toast.success('تم إنشاء الحساب بنجاح!');
    } catch {
      toast.error('فشل إنشاء الحساب. حاول مرة أخرى');
      throw new Error('register failed');
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserDoc(result.user, result.user.displayName || 'مستخدم');
      toast.success('أهلاً بك!');
    } catch {
      toast.error('فشل تسجيل الدخول بـ Google');
      throw new Error('google login failed');
    }
  };

  const loginWithPhone = async (phone: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    try {
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      return result;
    } catch {
      toast.error('فشل إرسال كود التحقق');
      throw new Error('phone login failed');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('تم تسجيل الخروج');
    } catch {
      toast.error('فشل تسجيل الخروج');
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      toast.success('تم حذف الحساب');
    } catch {
      toast.error('فشل حذف الحساب. سجل دخولك مجدداً وحاول');
    }
  };

  return (
    <AuthContext.Provider value={{
      user, userData, loading,
      loginWithEmail, registerWithEmail,
      loginWithGoogle, loginWithPhone,
      logout, deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}