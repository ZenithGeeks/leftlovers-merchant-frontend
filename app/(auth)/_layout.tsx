import { useMerchant } from "@/context/MerchantContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Stack, useRouter, useSegments } from "expo-router";
import * as React from "react";

const PUBLIC_ROUTES = new Set(["signin", "signup", "forgotPassword"]);
const ONBOARDING_ROUTES = new Set(["signup", "storeInfo", "notifyPage"]);

function getSubRoute(segments: string[]) {
  return segments.length > 1 ? segments[1] : undefined;
}

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();
  const sub = React.useMemo(
    () => getSubRoute(segments as string[]),
    [segments]
  );

  const { isLoaded, isSignedIn, user } = useFirebaseAuth();
  const { merchantId, merchantStatus } = useMerchant();

  React.useEffect(() => {
    if (!isLoaded) return;

    /* -------- NOT SIGNED IN -------- */
    if (!isSignedIn) {
      if (!sub || !PUBLIC_ROUTES.has(sub)) {
        router.replace("/(auth)/signin");
      }
      return;
    }

    /* -------- EMAIL NOT VERIFIED -------- */
    if (!user?.emailVerified) {
      if (sub !== "signup") {
        router.replace("/(auth)/signup");
      }
      return;
    }

    /* -------- MERCHANT NOT CREATED YET -------- */
    if (!merchantId) {
      if (sub !== "storeInfo") {
        router.replace("/(auth)/storeInfo");
      }
      return;
    }

    /* -------- MERCHANT PENDING -------- */
    if (merchantStatus === "PENDING") {
      if (sub !== "notifyPage") {
        router.replace("/(auth)/notifyPage");
      }
      return;
    }

    /* -------- READY -------- */
    if (!sub || ONBOARDING_ROUTES.has(sub)) {
      router.replace("/(tabs)/home");
    }
  }, [
    isLoaded,
    isSignedIn,
    user,
    sub,
    merchantId,
    merchantStatus,
    router,
  ]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
