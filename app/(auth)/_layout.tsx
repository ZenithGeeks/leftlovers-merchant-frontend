import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { fetchMerchant } from "@/services/store";
import { Stack, useRouter, useSegments } from "expo-router";
import * as React from "react";

const PUBLIC_AUTH_ROUTES = new Set(["signin", "signup", "forgotPassword"]);
const ONBOARDING_ROUTE = "storeInfo";
const NOTIFY_ROUTE = "notifyPage";

function getAuthSubRoute(segments: string[]): string | undefined {
  if (segments.length < 2) return undefined;
  return segments[1];
}

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();

  const sub = React.useMemo(
    () => getAuthSubRoute(segments as string[]),
    [segments]
  );

  const { isLoaded, isSignedIn, user } = useFirebaseAuth();
  const [checkingMerchant, setCheckingMerchant] = React.useState(false);

  React.useEffect(() => {
    if (!isLoaded) return;

    /* -------------------------
     * 1️⃣ Not signed in
     * ------------------------- */
    if (!isSignedIn) {
      if (!sub || !PUBLIC_AUTH_ROUTES.has(sub)) {
        router.replace("/(auth)/signin");
      }
      return;
    }

    /* -------------------------
     * 2️⃣ Email not verified
     * ------------------------- */
    if (!user?.emailVerified) {
      if (sub !== "signup") {
        router.replace("/(auth)/signup");
      }
      return;
    }

    /* -------------------------
     * 3️⃣ Check merchant (backend truth)
     * ------------------------- */
    if (!checkingMerchant) {
      setCheckingMerchant(true);

      fetchMerchant(user.uid)
        .then((merchant) => {
          // 🔴 No merchant → onboarding
          if (!merchant) {
            if (sub !== ONBOARDING_ROUTE) {
              router.replace("/(auth)/storeInfo");
            }
            return;
          }

          // 🟡 Merchant exists but still pending
          if (merchant.status === "PENDING") {
            if (sub !== NOTIFY_ROUTE) {
              router.replace("/(auth)/notifyPage");
            }
            return;
          }

          // 🟢 Merchant approved
          if (merchant.status === "APPROVED") {
            if (
              sub === ONBOARDING_ROUTE ||
              sub === NOTIFY_ROUTE ||
              (sub && PUBLIC_AUTH_ROUTES.has(sub))
            ) {
              router.replace("/(tabs)/home");
            }
            return;
          }

          // ⚠️ Fallback (e.g. rejected / unknown)
          router.replace("/(auth)/notifyPage");
        })
        .catch(() => {
          // Safe fallback if API fails
          router.replace("/(auth)/storeInfo");
        })
        .finally(() => {
          setCheckingMerchant(false);
        });

      return;
    }
  }, [isLoaded, isSignedIn, user, sub, router, checkingMerchant]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
