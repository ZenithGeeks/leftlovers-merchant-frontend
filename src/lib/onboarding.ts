import type { User as FirebaseUser } from "firebase/auth";

export type OnboardingStep = "email" | "store" | "notifyPage";

/**
 * Your app should store onboarding state somewhere you own:
 * - your backend DB
 * - Firestore
 * - or local state (temporary)
 */
export type AppUserProfile = {
  step?: OnboardingStep;
};

/** Default step if not found anywhere */
const DEFAULT_STEP: OnboardingStep = "email";

/**
 * Read user's current onboarding step.
 *
 * With Firebase, you cannot rely on user.unsafeMetadata.
 * So this function reads from an optional app profile.
 */
export function getStep(
  _user: FirebaseUser | null,
  profile?: AppUserProfile | null
): OnboardingStep {
  return profile?.step ?? DEFAULT_STEP;
}

/** Map a step to the route the user should be on next */
export function pathForStep(step: OnboardingStep): string {
  switch (step) {
    case "email":
      return "/(auth)/storeInfo";
    case "store":
      return "/(auth)/notifyPage";
    case "notifyPage":
      // If this is your last onboarding step,
      // usually you should go to your app/landing area.
      return "/(landing)/Check_can_login";
    default: {
      // Exhaustive safety
      const _exhaustive: never = step;
      return "/(auth)/signin";
    }
  }
}

/**
 * Persist step (Firebase version)
 *
 * You must save this in YOUR storage.
 * This function accepts a saver to keep it flexible and type-safe.
 */
export async function setStep(
  user: FirebaseUser,
  step: OnboardingStep,
  save: (uid: string, step: OnboardingStep) => Promise<void>
): Promise<void> {
  await save(user.uid, step);
}
