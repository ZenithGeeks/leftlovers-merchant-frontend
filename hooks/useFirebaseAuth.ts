import { auth } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoaded(true);
    });
    return unsub;
  }, []);

  return {
    isLoaded,
    isSignedIn: !!user,
    user,
  };
}
