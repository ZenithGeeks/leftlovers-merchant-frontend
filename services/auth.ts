import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
// services/auth/resolveMerchant.ts
import { fetchEmployees } from "@/services/employees";
import type { EmployeesResponse } from "@/types/employee";

export function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutFirebase() {
  return signOut(auth);
}

export function subscribeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function resolveMerchantForUser(
  userId: string,
  merchantIds: string[]
): Promise<{
  merchantId: string;
  role: string;
} | null> {
  for (const merchantId of merchantIds) {
    try {
      const res: EmployeesResponse = await fetchEmployees(merchantId);

      if (res.owner.id === userId) {
        return { merchantId, role: "Owner" };
      }

      const emp = res.employees.find((e) => e.id === userId);
      if (emp) {
        return { merchantId, role: emp.role };
      }
    } catch {
      continue;
    }
  }

  return null;
}
