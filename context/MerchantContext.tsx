import React, { createContext, useContext, useState } from "react";

export type MerchantStatus = "PENDING" | "APPROVED" | "SUSPENDED";

type MerchantContextValue = {
  merchantId: string | null;
  merchantStatus: MerchantStatus | null;
  hydrated: boolean;
  setMerchant: (id: string, status: MerchantStatus) => void;
  clearMerchant: () => void;
};

const MerchantContext = createContext<MerchantContextValue | undefined>(
  undefined
);

export function MerchantProvider({ children }: { children: React.ReactNode }) {
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [merchantStatus, setMerchantStatus] =
    useState<MerchantStatus | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const setMerchant = (id: string, status: MerchantStatus) => {
    setMerchantId(id);
    setMerchantStatus(status);
    setHydrated(true);
  };

  const clearMerchant = () => {
    setMerchantId(null);
    setMerchantStatus(null);
    setHydrated(false);
  };

  return (
    <MerchantContext.Provider
      value={{ merchantId, merchantStatus, hydrated, setMerchant, clearMerchant }}
    >
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const ctx = useContext(MerchantContext);
  if (!ctx) {
    throw new Error("useMerchant must be used inside MerchantProvider");
  }
  return ctx;
}
