// __tests__/PopularMenuItem.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import PopularMenuItem from "@/components/Home/Dashboard/PopularMenuItem";

// ✅ Keep mocks VERY simple (no require(), no JSX) to avoid _ReactNativeCSSInterop transform issues
jest.mock("react-native-heroicons/outline", () => ({
  ShoppingBagIcon: () => null,
}));

jest.mock("expo-image", () => ({
  Image: () => null,
}));

function findPressableAncestor(node: any) {
  let cur = node;
  while (cur && !cur.props?.onPress) cur = cur.parent;
  return cur;
}

describe("PopularMenuItem", () => {
  it("renders title, price, orders, and Orders label", () => {
    const { getByText } = render(
      <PopularMenuItem
        imageUrl="https://example.com/img.png"
        title="Pad Thai"
        price={99.2}
        orders={12}
        leftoverQty={10}
      />
    );

    expect(getByText("Pad Thai")).toBeTruthy();
    expect(getByText("99 THB")).toBeTruthy(); // toFixed(0)
    expect(getByText("12")).toBeTruthy();
    expect(getByText("Orders")).toBeTruthy();
  });

  it("shows Out of Stock when leftoverQty <= 0", () => {
    const { getByText } = render(
      <PopularMenuItem
        imageUrl=""
        title="Cheese"
        price={50}
        orders={1}
        leftoverQty={0}
      />
    );

    expect(getByText("Out of Stock")).toBeTruthy();
  });

  it("shows Low Stock when leftoverQty < 3", () => {
    const { getByText } = render(
      <PopularMenuItem
        imageUrl=""
        title="Cheese"
        price={50}
        orders={1}
        leftoverQty={2}
      />
    );

    expect(getByText("Low Stock")).toBeTruthy();
  });

  it("shows In Stock when leftoverQty >= 3", () => {
    const { getByText } = render(
      <PopularMenuItem
        imageUrl=""
        title="Cheese"
        price={50}
        orders={1}
        leftoverQty={3}
      />
    );

    expect(getByText("In Stock")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();

    const { getByText } = render(
      <PopularMenuItem
        imageUrl=""
        title="Pad Thai"
        price={99}
        orders={5}
        leftoverQty={10}
        onPress={onPress}
      />
    );

    // Pressable has no testID, so find the nearest parent with onPress.
    const titleNode = getByText("Pad Thai");
    const pressTarget = findPressableAncestor(titleNode);

    expect(pressTarget).toBeTruthy();
    fireEvent.press(pressTarget);

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
