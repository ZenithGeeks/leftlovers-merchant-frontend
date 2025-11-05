// utils/env.ts
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE?.replace(/\/+$/, '') || 'http://localhost:3000/api';

// If you keep a public merchant id in dev, you can set it via .env
export const DEV_MERCHANT_ID = process.env.EXPO_PUBLIC_MERCHANT_ID || '';
