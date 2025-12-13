// __tests__/PopularMenuSection.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import PopularMenuSection from "@/components/Home/Dashboard/PopularMenuSection";

describe("PopularMenuSection", () => {
  it("renders the title", () => {
    const { getByText } = render(
      <PopularMenuSection title="Popular menus" />
    );

    expect(getByText("Popular menus")).toBeTruthy();
  });

  it("renders children inside the section", () => {
    const { getByText } = render(
      <PopularMenuSection title="Popular menus">
        <Text>Child A</Text>
        <Text>Child B</Text>
      </PopularMenuSection>
    );

    expect(getByText("Child A")).toBeTruthy();
    expect(getByText("Child B")).toBeTruthy();
  });

  it("renders even when children is null", () => {
    const { getByText } = render(
      <PopularMenuSection title="Popular menus">{null}</PopularMenuSection>
    );

    expect(getByText("Popular menus")).toBeTruthy();
  });
});
