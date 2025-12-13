import { AuthScreenWrapper } from "@/components/Authen/AuthScreenWrapper"; // ✅ ปรับ path ให้ตรง
import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

// ✅ mock expo-router Stack.Screen (ไม่งั้น Jest งอแง)
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
}));

// ✅ mock SafeAreaView (ถ้าโปรเจกต์คุณ mock ไว้ใน jest.setup.ts แล้ว อันนี้เอาออกได้)
jest.mock("react-native-safe-area-context", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    SafeAreaView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

describe("AuthScreenWrapper", () => {
  it("renders children when keyboard=false (default)", () => {
    const { getByText, UNSAFE_queryByType } = render(
      <AuthScreenWrapper>
        <Text>HELLO</Text>
      </AuthScreenWrapper>
    );

    expect(getByText("HELLO")).toBeTruthy();

    // should NOT have KeyboardAvoidingView in this mode
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeyboardAvoidingView } = require("react-native");
    expect(UNSAFE_queryByType(KeyboardAvoidingView)).toBeNull();
  });

  it("wraps children with KeyboardAvoidingView + ScrollView when keyboard=true", () => {
    const { getByText, UNSAFE_getByType } = render(
      <AuthScreenWrapper keyboard>
        <Text>HELLO</Text>
      </AuthScreenWrapper>
    );

    expect(getByText("HELLO")).toBeTruthy();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KeyboardAvoidingView, ScrollView } = require("react-native");
    expect(UNSAFE_getByType(KeyboardAvoidingView)).toBeTruthy();
    expect(UNSAFE_getByType(ScrollView)).toBeTruthy();
  });
});
