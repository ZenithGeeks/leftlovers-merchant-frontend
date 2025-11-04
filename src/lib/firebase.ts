// src/lib/firebase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as AuthNS from 'firebase/auth';
import {
  getAuth,
  initializeAuth,
  type Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FB_API_KEY ?? (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_FB_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN ?? (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_FB_AUTH_DOMAIN,
  messagingSenderId: process.env.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID ?? (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID,
  projectId: process.env.EXPO_PUBLIC_FB_PROJECT_ID ?? (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET ?? (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_FB_STORAGE_BUCKET,
  appId: process.env.EXPO_PUBLIC_FB_APP_ID ?? (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_FB_APP_ID,
} as const;

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const persistence =
  (AuthNS as any).getReactNativePersistence?.(AsyncStorage);

let _auth: Auth;
try {
  _auth = initializeAuth(app, {
    persistence,
  });
} catch {
  _auth = getAuth(app);
}
_auth.useDeviceLanguage?.();

export const auth = _auth;