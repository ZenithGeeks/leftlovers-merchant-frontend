import React from "react";
import { render } from "@testing-library/react-native";
import AvatarInitial from "../components/employees/AvatarInitial";

describe("AvatarInitial", () => {
  it("renders the first letter uppercased", () => {
    const { getByText } = render(<AvatarInitial name="earth" />);
    expect(getByText("E")).toBeTruthy();
  });

  it("trims spaces before taking the first letter", () => {
    const { getByText } = render(<AvatarInitial name="   earth  " />);
    expect(getByText("E")).toBeTruthy();
  });

  it('renders "?" when name is empty string', () => {
    const { getByText } = render(<AvatarInitial name="" />);
    expect(getByText("?")).toBeTruthy();
  });

  it('renders "?" when name is only spaces', () => {
    const { getByText } = render(<AvatarInitial name="    " />);
    expect(getByText("?")).toBeTruthy();
  });

  it("uses the first character even if it's not a letter", () => {
    const { getByText } = render(<AvatarInitial name="1earth" />);
    expect(getByText("1")).toBeTruthy();
  });
});
