// app/(auth)/_layout.tsx
import { getStep, pathForStep } from "@/src/lib/onboarding";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import * as React from "react";

// Public screens inside (auth)
const PUBLIC_AUTH_ROUTES = new Set(["signin", "signup", "forgotPassword"]);

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments(); // e.g. ["(auth)", "signin"]
  const sub = (segments[1] as string | undefined) ?? undefined;

  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  React.useEffect(() => {
    if (!authLoaded || !userLoaded) return;

    // Not signed in → keep within public auth screens
    if (!isSignedIn) {
      if (!sub || !PUBLIC_AUTH_ROUTES.has(sub)) {
        router.replace("/(auth)/signin");
      }
      return;
    }

    // Signed in → route by onboarding step
    const step = getStep(user);
    const nextPath = pathForStep(step);
    const currentPath = `/${segments.join("/")}`;

    // console.log("STEP:", step, "CURRENT:", currentPath, "NEXT:", nextPath);

    if (nextPath && currentPath !== nextPath) {
      router.replace(nextPath as any);
    }
  }, [
    authLoaded,
    userLoaded,
    isSignedIn,
    user, 
    user?.unsafeMetadata?.step, // 🔑 react when step changes
    sub,
    router,
    segments,
  ]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
