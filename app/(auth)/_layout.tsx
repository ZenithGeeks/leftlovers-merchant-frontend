import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { getStep, pathForStep } from "@/src/lib/onboarding";
import { Stack, useRouter, useSegments } from "expo-router";
import * as React from "react";

const PUBLIC_AUTH_ROUTES = new Set(["signin", "signup", "forgotPassword"]);

function getAuthSubRoute(segments: string[]): string | undefined {
  if (segments.length < 2) return undefined;
  return segments[1];
}

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();

  const sub = React.useMemo(
    () => getAuthSubRoute(segments as string[]),
    [segments],
  );

  const { isLoaded: authLoaded, isSignedIn, user } = useFirebaseAuth();

  React.useEffect(() => {
    if (!authLoaded) return;
    if (!isSignedIn) {
      if (!sub || !PUBLIC_AUTH_ROUTES.has(sub)) {
        router.replace("/(auth)/signin");
      }
      return;
    }
    const step = getStep(user);
    const nextPath = pathForStep(step);
    if (nextPath) {
      router.replace(nextPath as any);
    }
  }, [authLoaded, isSignedIn, user, sub, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
