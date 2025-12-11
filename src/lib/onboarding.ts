import type { User as FirebaseUser } from "firebase/auth";

export type OnboardingStep = "email" | "store" | "notifyPage" | "done";

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
      return "/(auth)/signup";
    case "store":
      return "/(auth)/storeInfo";
    case "notifyPage":
      return "/(auth)/notifyPage";
    case "done":
      return "/(tabs)/home";
    default: {
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
