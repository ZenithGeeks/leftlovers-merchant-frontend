import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type MerchantStatus = "PENDING" | "APPROVED" | "SUSPENDED";

type MerchantContextValue = {
  merchantId: string;
  merchantStatus: MerchantStatus | null;
  hydrated: boolean;
  setMerchant: (id: string, status: MerchantStatus | null) => void;
  clearMerchant: () => void;
};

const MerchantContext = createContext<MerchantContextValue | undefined>(undefined);

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const [merchantId, setMerchantId] = useState<string>("");
  const [merchantStatus, setMerchantStatus] = useState<MerchantStatus | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const setMerchant = (id: string, status: MerchantStatus | null) => {
    setMerchantId(id);
    setMerchantStatus(status);
    setHydrated(true);
  };

  const clearMerchant = () => {
    setMerchantId("");
    setMerchantStatus(null);
    setHydrated(false);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) clearMerchant();
    });
    return unsub;
  }, []);

  const value = useMemo(
    () => ({ merchantId, merchantStatus, hydrated, setMerchant, clearMerchant }),
    [merchantId, merchantStatus, hydrated]
  );

  return <MerchantContext.Provider value={value}>{children}</MerchantContext.Provider>;
}

export function useMerchant() {
  const ctx = useContext(MerchantContext);
  if (!ctx) throw new Error("useMerchant must be used inside MerchantProvider");
  return ctx;
}
