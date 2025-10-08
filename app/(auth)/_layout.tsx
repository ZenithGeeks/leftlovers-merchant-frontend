import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // รอโหลดสถานะก่อน
  if (!isLoaded) return null;

  // ถ้า login แล้ว ให้เด้งออกจากกลุ่ม auth
  return isSignedIn ? (
    <Redirect href="/(tabs)/index" /> 
  ) : (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
