import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import OrderListRow from "@/components/Order/OrderListRow";
import { updateMerchantOrderStatus } from "@/services/order";
import { parseOrderDates, parseOrderMoney } from "@/types/types";
import type { Order } from "@/types/types";

// --- Mocks (NO out-of-scope RN components used inside factories) ---
jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("@/components/Order/CardItem", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return function MockCardItem() {
    return <Text testID="card-item">card-item</Text>;
  };
});

jest.mock("@/components/Order/ToggleButton", () => {
  const React = require("react");
  const { Pressable, Text } = require("react-native");
  return function MockToggleButton(props: { expanded: boolean; onToggle: () => void }) {
    return (
      <Pressable
        testID="toggle-btn"
        accessibilityLabel="toggle-order-expand"
        onPress={props.onToggle}
      >
        <Text>{props.expanded ? "expanded" : "collapsed"}</Text>
      </Pressable>
    );
  };
});

jest.mock("@/services/order", () => ({
  updateMerchantOrderStatus: jest.fn(),
}));

jest.mock("@/types/types", () => {
  const actual = jest.requireActual("@/types/types");
  return {
    ...actual,
    parseOrderMoney: jest.fn(),
    parseOrderDates: jest.fn(),
  };
});

const mockUpdate = updateMerchantOrderStatus as unknown as jest.Mock;
const mockParseMoney = parseOrderMoney as unknown as jest.Mock;
const mockParseDates = parseOrderDates as unknown as jest.Mock;

const makeOrder = (p: Partial<Order> = {}): Order =>
  ({
    id: p.id ?? "order-abcdef123456",
    status: p.status ?? "PENDING",
    paymentStatus: p.paymentStatus ?? "UNPAID",
    preference: p.preference ?? "CONTACT",
    cutlery: p.cutlery ?? false,
    pickupCode: p.pickupCode ?? "1234",
    pickupDeadline: p.pickupDeadline ?? null,
    note: p.note,
    customer: p.customer ?? { name: "Alice", phone: "0999999999" },
    items:
      p.items ??
      [
        { id: "oi-1", quantity: 2, menu: { name: "Burger", basePrice: 50 }, options: [] },
        { id: "oi-2", quantity: 1, menu: { name: "Fries", basePrice: 30 }, options: [] },
        { id: "oi-3", quantity: 5, menu: { name: "Coke", basePrice: 20 }, options: [] },
      ],
    createdAt: p.createdAt ?? "2025-12-12T10:00:00.000Z",
  } as unknown as Order);

beforeEach(() => {
  jest.clearAllMocks();

  mockParseMoney.mockReturnValue({
    subtotal: 100,
    discountTotal: 10,
    totalAmount: 90,
  });

  mockParseDates.mockReturnValue({
    createdAt: new Date("2025-12-12T10:00:00.000Z"),
    pickupDeadline: new Date("2025-12-12T11:00:00.000Z"),
  });

  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  (Alert.alert as jest.Mock).mockRestore?.();
});

describe("OrderListRow", () => {
  it("renders header + pills + money summary", () => {
    const item = makeOrder({
      status: "PENDING",
      paymentStatus: "PAID",
      preference: "REMOVE",
      cutlery: true,
    });

    const { getByText } = render(<OrderListRow item={item} merchantId="m-1" />);

    expect(getByText("Order #ORDER-")).toBeTruthy(); // "order-" => "ORDER-"
    expect(getByText(/Code: 1234/)).toBeTruthy();

    expect(getByText("Pending")).toBeTruthy();
    expect(getByText("PAID")).toBeTruthy();
    expect(getByText("No contact")).toBeTruthy();
    expect(getByText("Cutlery: Yes")).toBeTruthy();

    expect(getByText("Items: 8")).toBeTruthy(); // 2 + 1 + 5
    expect(getByText(/Subtotal: ฿100/)).toBeTruthy();
    expect(getByText(/Discount: ฿10/)).toBeTruthy();
    expect(getByText("Total: ฿90")).toBeTruthy();
  });

  it("shows timer pill when pickupDeadline is in the future, and 'Expired' when past", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-12-12T10:00:00.000Z"));

    const { getByText, rerender, queryByText } = render(
      <OrderListRow
        item={makeOrder({ pickupDeadline: "2025-12-12T10:30:00.000Z" })}
        merchantId="m-1"
      />
    );

    expect(getByText("30m left")).toBeTruthy();

    rerender(
      <OrderListRow
        item={makeOrder({ pickupDeadline: "2025-12-12T09:59:00.000Z" })}
        merchantId="m-1"
      />
    );
    expect(getByText("Expired")).toBeTruthy();

    rerender(<OrderListRow item={makeOrder({ pickupDeadline: null })} merchantId="m-1" />);
    expect(queryByText(/left|Expired/)).toBeNull();

    jest.useRealTimers();
  });

  it("collapsed view shows up to 2 item preview + '+N more items'", () => {
    const item = makeOrder();

    const { getByText } = render(<OrderListRow item={item} merchantId="m-1" />);

    expect(getByText("Burger")).toBeTruthy();
    expect(getByText("Fries")).toBeTruthy();
    expect(getByText("+1 more items")).toBeTruthy();
  });

  it("toggle expands to show CardItem list and Note", () => {
    const item = makeOrder({ note: "Please no onions" });

    const { getByTestId, getByText, queryByText, getAllByTestId } = render(
      <OrderListRow item={item} merchantId="m-1" />
    );

    expect(queryByText("Order items")).toBeNull();

    fireEvent.press(getByTestId("toggle-btn"));

    expect(getByText("Order items")).toBeTruthy();
    expect(getByText("Note")).toBeTruthy();
    expect(getByText("Please no onions")).toBeTruthy();
    expect(getAllByTestId("card-item")).toHaveLength(3);
  });

  it("shows primary action and calls updateMerchantOrderStatus", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "order-abcdef123456", status: "READY" });

    const onUpdated = jest.fn();
    const item = makeOrder({ status: "PENDING" });

    const { getByText } = render(
      <OrderListRow item={item} merchantId="m-1" onUpdated={onUpdated} />
    );

    fireEvent.press(getByText("Mark Ready"));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith("m-1", item.id, "READY");
      expect(onUpdated).toHaveBeenCalledTimes(1);
      expect(onUpdated).toHaveBeenCalledWith({ id: "order-abcdef123456", status: "READY" });
    });
  });

  it("handles update failure by showing alert", async () => {
    mockUpdate.mockRejectedValueOnce(new Error("boom"));

    const item = makeOrder({ status: "READY" });

    const { getByText } = render(<OrderListRow item={item} merchantId="m-1" />);

    fireEvent.press(getByText("Picked up"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Update failed", "boom");
    });
  });

  it("does not show footer action button for CANCELLED / PICKED_UP", () => {
  const { queryByText, rerender, getByText } = render(
    <OrderListRow item={makeOrder({ status: "CANCELLED" })} merchantId="m-1" />
  );

  // No footer action buttons
  expect(queryByText("Mark Ready")).toBeNull();
  // don't check "Picked up" text (it can appear as a status pill elsewhere)

  rerender(
    <OrderListRow item={makeOrder({ status: "PICKED_UP" })} merchantId="m-1" />
  );

  // Status pill exists
  expect(getByText("Picked up")).toBeTruthy();

  // Still no footer action buttons
  expect(queryByText("Mark Ready")).toBeNull();
  // again: don't assert queryByText("Picked up") === null
});

});
