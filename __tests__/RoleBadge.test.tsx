// __tests__/RoleBadge.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import RoleBadge from "@/components/employees/RoleBadge";

describe("RoleBadge", () => {
  it("renders the role text", () => {
    const { getByText } = render(<RoleBadge role={"Manager" as any} />);
    expect(getByText("Manager")).toBeTruthy();
  });

  it("renders each supported role", () => {
    const roles = ["Owner", "Manager", "Cashier", "Stock"] as const;

    for (const role of roles) {
      const { getByText, unmount } = render(<RoleBadge role={role as any} />);
      expect(getByText(role)).toBeTruthy();
      unmount();
    }
  });
});
