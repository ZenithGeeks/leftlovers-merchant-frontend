import type { User as FirebaseUser } from "firebase/auth";

export type OnboardingStep = "email" | "store" | "notifyPage";

export type AppUserProfile = {
  step?: OnboardingStep;
};

const DEFAULT_STEP: OnboardingStep = "email";
export function getStep(
  _user: FirebaseUser | null,
  profile?: AppUserProfile | null
): OnboardingStep {
  return profile?.step ?? DEFAULT_STEP;
}

export function pathForStep(step: OnboardingStep): string {
  switch (step) {
    case "email":
      return "/(auth)/storeInfo";
    case "store":
      return "/(auth)/notifyPage";
    case "notifyPage":
      return "/(landing)/Check_can_login";
    default: {
      const _exhaustive: never = step;
      return "/(auth)/signin";
    }
  }
}
export async function setStep(
  user: FirebaseUser,
  step: OnboardingStep,
  save: (uid: string, step: OnboardingStep) => Promise<void>
): Promise<void> {
  await save(user.uid, step);
}
