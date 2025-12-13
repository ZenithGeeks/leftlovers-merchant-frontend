import React from "react";
import { render } from "@testing-library/react-native";

import CardItem from "@/components/Order/CardItem";
import type { OrderItem } from "@/types/types";

const makeOrderItem = (p: Partial<OrderItem> = {}): OrderItem =>
  ({
    id: p.id ?? "oi-1",
    quantity: p.quantity,
    menu: p.menu,
    options: p.options,
  } as unknown as OrderItem);

describe("CardItem", () => {
  it("renders default values when menu/qty/options are missing", () => {
    const orderItem = makeOrderItem({
      quantity: undefined,
      menu: undefined,
      options: undefined,
    });

    const { getByText } = render(<CardItem orderItem={orderItem} />);

    // default name
    expect(getByText("Menu item")).toBeTruthy();

    // qty defaults to 0
    expect(getByText("฿0 / item")).toBeTruthy();
    expect(getByText("(0 × ฿0)")).toBeTruthy();
    expect(getByText("฿0")).toBeTruthy();
  });

  it("computes unit price and line total from basePrice + option deltas", () => {
    const orderItem = makeOrderItem({
      quantity: 2,
      menu: { name: "Pad Thai", basePrice: 50 } as any,
      options: [
        { id: "opt-1", option: { name: "Extra egg", priceDelta: 5 } } as any,
        { id: "opt-2", option: { name: "Cheese", priceDelta: 10 } } as any,
      ],
    });

    const { getByText } = render(<CardItem orderItem={orderItem} />);

    // name
    expect(getByText("Pad Thai")).toBeTruthy();

    // options lines (match by substring/regex because of nested Text + bullet)
    expect(getByText(/Extra egg/)).toBeTruthy();
    expect(getByText(/Extra egg.*\+฿5/)).toBeTruthy();

    expect(getByText(/Cheese/)).toBeTruthy();
    expect(getByText(/Cheese.*\+฿10/)).toBeTruthy();

    // base 50 + (5+10) = 65
    expect(getByText("฿65 / item")).toBeTruthy();
    expect(getByText("(2 × ฿65)")).toBeTruthy();

    // 65 * 2 = 130
    expect(getByText("฿130")).toBeTruthy();
  });

  it("treats NaN option delta as 0 and still renders +฿0", () => {
    const orderItem = makeOrderItem({
      quantity: 3,
      menu: { name: "Burger", basePrice: 40 } as any,
      options: [
        // priceDelta is not a number -> Number("x") => NaN -> treated as 0
        { id: "opt-1", option: { name: "Weird", priceDelta: "x" } } as any,
      ],
    });

    const { getByText } = render(<CardItem orderItem={orderItem} />);

    expect(getByText("Burger")).toBeTruthy();

    // Option line should show +฿0
    expect(getByText(/Weird/)).toBeTruthy();
    expect(getByText(/Weird.*\+฿0/)).toBeTruthy();

    // unit = 40 + 0
    expect(getByText("฿40 / item")).toBeTruthy();
    expect(getByText("(3 × ฿40)")).toBeTruthy();
    expect(getByText("฿120")).toBeTruthy();
  });

  it("uses menu fallback name when menu.name is missing", () => {
    const orderItem = makeOrderItem({
      quantity: 1,
      menu: { basePrice: 99 } as any,
      options: [],
    });

    const { getByText } = render(<CardItem orderItem={orderItem} />);

    expect(getByText("Menu item")).toBeTruthy();
    expect(getByText("฿99 / item")).toBeTruthy();
    expect(getByText("(1 × ฿99)")).toBeTruthy();
    expect(getByText("฿99")).toBeTruthy();
  });
});
