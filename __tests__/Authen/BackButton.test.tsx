import BackButton from "@/components/Authen/BackButton";
import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import React from "react";

// ✅ mock expo-router ให้ useRouter เป็น jest.fn()
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// ✅ mock IconSymbol กัน expo-symbols/native ทำเทสพัง
jest.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: () => null,
}));

describe("BackButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls router.back() when onPress is not provided", () => {
    const back = jest.fn();
    (useRouter as unknown as jest.Mock).mockReturnValue({ back });

    const { getByLabelText } = render(<BackButton />);
    fireEvent.press(getByLabelText("Go back"));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("calls onPress when provided and does NOT call router.back()", () => {
    const back = jest.fn();
    (useRouter as unknown as jest.Mock).mockReturnValue({ back });

    const onPress = jest.fn();
    const { getByLabelText } = render(<BackButton onPress={onPress} />);

    fireEvent.press(getByLabelText("Go back"));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(back).not.toHaveBeenCalled();
  });

  it("renders with accessibility label", () => {
    const back = jest.fn();
    (useRouter as unknown as jest.Mock).mockReturnValue({ back });

    const { getByLabelText } = render(<BackButton />);
    expect(getByLabelText("Go back")).toBeTruthy();
  });
});
