import { AuthHeader } from "@/components/Authen/AuthHeader"; // ✅ ปรับ path ให้ตรงโปรเจกต์
import { render } from "@testing-library/react-native";
import React from "react";

describe("AuthHeader", () => {
  it("renders title", () => {
    const { getByText } = render(<AuthHeader title="Verify your email" />);
    expect(getByText("Verify your email")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    const { getByText } = render(
      <AuthHeader title="Verify your email" subtitle="Check your inbox." />
    );

    expect(getByText("Verify your email")).toBeTruthy();
    expect(getByText("Check your inbox.")).toBeTruthy();
  });

  it("does not render subtitle when not provided", () => {
    const { queryByText } = render(<AuthHeader title="Create an account" />);

    expect(queryByText("Check your inbox.")).toBeNull();
  });
});
