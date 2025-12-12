import { useMerchant } from "@/context/MerchantContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Stack, useRouter, useSegments } from "expo-router";
import * as React from "react";

const PUBLIC_ROUTES = new Set(["signin", "signup", "forgotPassword"]);

function getSubRoute(segments: string[]) {
  return segments.length >= 2 ? segments[1] : undefined;
}

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();
  const sub = getSubRoute(segments as string[]);
  const { isLoaded, isSignedIn, user } = useFirebaseAuth();
  const { merchantId, merchantStatus } = useMerchant();

  React.useEffect(() => {
    if (!isLoaded) return;

    /* NOT SIGNED IN */
    if (!isSignedIn) {
      if (!sub || !PUBLIC_ROUTES.has(sub)) {
        router.replace("/(auth)/signin");
      }
      return;
    }

    /* EMAIL NOT VERIFIED */
    if (!user?.emailVerified) {
      if (sub !== "signup") {
        router.replace("/(auth)/signup");
      }
      return;
    }

    /* NO MERCHANT */
    if (!merchantId) {
      router.replace("/(auth)/storeInfo");
      return;
    }

    /* MERCHANT PENDING */
    if (merchantStatus === "PENDING") {
      router.replace("/(auth)/notifyPage");
      return;
    }

    /* MERCHANT APPROVED */
    router.replace("/(tabs)/home");
  }, [
    isLoaded,
    isSignedIn,
    user,
    sub,
    merchantId,
    merchantStatus,
    router,
  ]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
