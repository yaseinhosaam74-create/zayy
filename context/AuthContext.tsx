'use client';

import {
  createContext, useContext, useEffect, useState, ReactNode,
} from 'react';
import {
  User, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signInWithPopup,
  GoogleAuthProvider, signOut, onAuthStateChanged,
  updateProfile, deleteUser, RecaptchaVerifier,
  signInWithPhoneNumber, ConfirmationResult,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, deleteDoc, serverTimestamp, updateDoc,
} from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import toast from 'react-hot-toast';

export type UserData = {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photo: string;
  points: number;
  coins: number;
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
  sendPhoneOtp: (phone: string) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (confirmation: ConfirmationResult, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u);
      if (u) await fetchUserData(u.uid);
      else setUserData(null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) setUserData(snap.data() as UserData);
    } catch {}
  };

  const refreshUserData = async () => {
    if (user) await fetchUserData(user.uid);
  };

  const createUserDoc = async (u: User, name: string, phone?: string) => {
    const ref = doc(db, 'users', u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: u.uid, name,
        email: u.email || '',
        phone: phone || u.phoneNumber || '',
        photo: u.photoURL || '',
        points: 0,
        coins: 0,
        wishlist: [],
        createdAt: serverTimestamp(),
        blocked: false,
      });
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success('أهلاً بعودتك!');
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await createUserDoc(result.user, name);
    toast.success('تم إنشاء الحساب بنجاح!');
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await createUserDoc(result.user, result.user.displayName || 'مستخدم');
    toast.success('أهلاً بك!');
  };

  const sendPhoneOtp = async (phone: string): Promise<ConfirmationResult> => {
    const container = document.getElementById('recaptcha-container');
    if (!container) throw new Error('reCAPTCHA container not found');

    // Clear previous
    container.innerHTML = '';

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {},
    });

    await verifier.render();
    const formatted = phone.startsWith('+') ? phone : `+2${phone.replace(/^0/, '')}`;
    const result = await signInWithPhoneNumber(auth, formatted, verifier);
    return result;
  };

  const verifyPhoneOtp = async (confirmation: ConfirmationResult, otp: string) => {
    const result = await confirmation.confirm(otp);
    await createUserDoc(result.user, result.user.displayName || 'مستخدم', result.user.phoneNumber || '');
    toast.success('تم تسجيل الدخول بنجاح!');
  };

  const logout = async () => {
    await signOut(auth);
    toast.success('تم تسجيل الخروج');
  };

  const deleteAccount = async () => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid));
    await deleteUser(user);
    toast.success('تم حذف الحساب');
  };

  return (
    <AuthContext.Provider value={{
      user, userData, loading,
      loginWithEmail, registerWithEmail,
      loginWithGoogle, sendPhoneOtp, verifyPhoneOtp,
      logout, deleteAccount, refreshUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}