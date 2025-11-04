// src/lib/onboarding.ts
import { UserResource } from "@clerk/types";

export type OnboardingStep = "email" | "phone" | "store" | "notifyPage";

/** Read user's current onboarding step (defaults to "email") */
export function getStep(user?: UserResource | null): OnboardingStep {
  const meta = user?.unsafeMetadata ?? {};
  return (meta.step as OnboardingStep) || "email";
}

/** Map a step to the route the user should be on next */
export function pathForStep(step: OnboardingStep): string {
  switch (step) {
    case "email":
      return "/(auth)/phone";        // after email verification
    case "phone":
      return "/(auth)/storeInfo";    // after phone verification
    case "store":
      return "/(auth)/storeInfo";    // stay on store form until submitted
    case "notifyPage":
      return "/(auth)/notifyPage";       // waiting for approval → back to sign-in
  }
}

/** Persist the step on Clerk user */
export async function setStep(user: any, step: OnboardingStep) {
  const prev = (user?.unsafeMetadata ?? {}) as Record<string, unknown>;
  await user.update({ unsafeMetadata: { ...prev, step } });
}
