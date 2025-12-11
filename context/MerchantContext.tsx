import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

type MerchantContextValue = {
  merchantId: string | null;
  setMerchantId: (id: string | null) => void;
};

const MerchantContext = createContext<MerchantContextValue | undefined>(
  undefined
);

export const MerchantProvider = ({ children }: { children: ReactNode }) => {
  const [merchantId, setMerchantId] = useState<string | null>(null);

  return (
    <MerchantContext.Provider value={{ merchantId, setMerchantId }}>
      {children}
    </MerchantContext.Provider>
  );
};

export const useMerchant = (): MerchantContextValue => {
  const ctx = useContext(MerchantContext);
  if (!ctx) {
    throw new Error("useMerchant must be used within <MerchantProvider />");
  }
  return ctx;
};
