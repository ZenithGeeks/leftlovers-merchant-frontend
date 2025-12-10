// ✅ IMPORTANT: this line ensures we're augmenting the real module
import "firebase/auth";

import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";

declare module "firebase/auth" {
  export function initializeAuth(
    app: FirebaseApp,
    deps?: { persistence?: unknown }
  ): Auth;

  export function getReactNativePersistence(
    storage: unknown
  ): unknown;
}
