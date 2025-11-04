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
      return "/(auth)/phone";       
    case "phone":
      return "/(auth)/storeInfo";    
    case "store":
      return "/(auth)/storeInfo";    
    case "notifyPage":
      return "/(auth)/notifyPage";       
  }
}

/** Persist the step on Clerk user */
export async function setStep(user: any, step: OnboardingStep) {
  const prev = (user?.unsafeMetadata ?? {}) as Record<string, unknown>;
  await user.update({ unsafeMetadata: { ...prev, step } });
}
