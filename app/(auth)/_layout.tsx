import { useMerchant } from "@/context/MerchantContext";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Stack, useRouter, useSegments } from "expo-router";
import * as React from "react";

const PUBLIC_ROUTES = new Set(["signin", "signup", "forgotPassword"]);

function getSubRoute(segments: string[]) {
  return segments.length > 1 ? segments[1] : undefined;
}

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();
  const sub = React.useMemo(() => getSubRoute(segments as string[]), [segments]);

  const { isLoaded, isSignedIn, user } = useFirebaseAuth();
  const { merchantId, merchantStatus, hydrated } = useMerchant();

  React.useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      if (!sub || !PUBLIC_ROUTES.has(sub)) router.replace("/(auth)/signin");
      return;
    }

    if (!user?.emailVerified) {
      if (sub !== "signup") router.replace("/(auth)/signup");
      return;
    }

    if (!hydrated) return;

    if (!merchantId) {
      if (sub !== "storeInfo") router.replace("/(auth)/storeInfo");
      return;
    }

    if (merchantStatus === "PENDING") {
      if (sub !== "notifyPage") router.replace("/(auth)/notifyPage");
      return;
    }

    router.replace("/(tabs)/home");
  }, [isLoaded, isSignedIn, user, sub, merchantId, merchantStatus, hydrated, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
