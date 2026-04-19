import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAQUl5LmLyLf07-lCjyzWeAjz1ityY7PUo",
  authDomain: "my-store-9d669.firebaseapp.com",
  projectId: "my-store-9d669",
  storageBucket: "my-store-9d669.firebasestorage.app",
  messagingSenderId: "655622141675",
  appId: "1:655622141675:web:4a3e0fb6bf995bdf89b0ae",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;