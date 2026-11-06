import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogleAccount = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Foydalanuvchi',
      email: user.email || '',
      photoURL: user.photoURL || ''
    };
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    // Standard human readable error messages in Uzbek
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Tizimga kirish oynasi yopildi. Qaytadan urinib ko'ring.");
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error("Pop-up oyna brauzeringiz tomonidan bloklandi. Iltimos ruxsat bering.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error("Bir vaqtda bir nechta kirish so'rovi yuborildi.");
    } else {
      throw new Error(error.message || "Google orqali kirishda xatolik yuz berdi");
    }
  }
};

export const logoutFirebase = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Firebase Logout Error:', error);
  }
};
