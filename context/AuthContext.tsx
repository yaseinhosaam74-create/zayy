'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, updateProfile, deleteUser, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import toast from 'react-hot-toast';

type UserData = {
  uid: string;
  name: string;
  email: string;
  createdAt: any;
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
  const [loading, setLoading] = useState<boolean>(true);

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
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const loginWithPhone = async (phone: string, appVerifier: RecaptchaVerifier) => {
    return await signInWithPhoneNumber(auth, phone, appVerifier);
  };

  const loginWithEmail = async (email: string, password: string) => {
    // Implementation for login
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    // Implementation for registration
  };

  const loginWithGoogle = async () => {
    // Implementation for Google login
  };

  const logout = async () => {
    await auth.signOut();
  };

  const deleteAccount = async () => {
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginWithPhone,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
