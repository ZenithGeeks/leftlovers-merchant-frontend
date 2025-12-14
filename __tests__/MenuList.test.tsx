// __tests__/MenuList.test.tsx
import React from "react";
import { Alert } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import MenuList from "@/components/Menu/Menu-List";
import { DeleteMenuItem, updateMenuStatus } from "@/services/menu";
import type { MenuItemAPI } from "@/types/types";

// ✅ Mock Fonts (so it won't crash on style={{ fontFamily: Fonts.bold }})
jest.mock("@/constants/theme", () => ({
  Fonts: { bold: "Bold", regular: "Regular", medium: "Medium" },
}));

// ✅ Mock heroicons
jest.mock("react-native-heroicons/outline", () => ({
  PencilSquareIcon: () => null,
  TrashIcon: () => null,
}));

// ✅ Mock expo-image
jest.mock("expo-image", () => {
  const React = require("react");
  return {
    Image: (props: any) => <>{props.children}</>,
  };
});

// ✅ Mock router
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// ✅ Mock services
jest.mock("@/services/menu", () => ({
  updateMenuStatus: jest.fn(),
  DeleteMenuItem: jest.fn(),
}));

const mockUpdateStatus = updateMenuStatus as unknown as jest.Mock;
const mockDeleteMenuItem = DeleteMenuItem as unknown as jest.Mock;

const makeItem = (
  p: Partial<MenuItemAPI> & Pick<MenuItemAPI, "id" | "name">
): MenuItemAPI =>
  ({
    id: p.id,
    name: p.name,
    status: p.status ?? "DRAFT",
    basePrice: p.basePrice ?? 10,
    photoUrl: (p as any).photoUrl ?? "", // component uses photoUrl
    leftoverQty: p.leftoverQty ?? 5,
  } as any);

describe("MenuList", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUpdateStatus.mockReset();
    mockDeleteMenuItem.mockReset();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    (Alert.alert as unknown as jest.Mock).mockRestore?.();
  });

  it("renders empty state when no items", () => {
    const { getByText } = render(<MenuList items={[]} merchantId="m1" />);
    expect(getByText("No items")).toBeTruthy();
  });

  it("renders item name, price and stock badge", () => {
    const items: MenuItemAPI[] = [
      makeItem({
        id: "i1",
        name: "Pad Thai",
        basePrice: 25,
        leftoverQty: 3,
        status: "LIVE",
      }),
    ];

    const { getByText } = render(<MenuList items={items} merchantId="m1" />);

    expect(getByText("Pad Thai")).toBeTruthy();
    expect(getByText(/THB/)).toBeTruthy(); // locale formatting may add decimals/commas
    expect(getByText("In-Stock: 3")).toBeTruthy();
  });

  it("blocks enabling switch when stock is 0 (shows alert, no API call)", () => {
    const items: MenuItemAPI[] = [
      makeItem({ id: "i1", name: "Cheese", status: "DRAFT", leftoverQty: 0 }),
    ];

    const { getByLabelText } = render(
      <MenuList items={items} merchantId="m1" />
    );

    fireEvent(getByLabelText("Cheese-switch"), "valueChange", true);

    expect(Alert.alert).toHaveBeenCalledWith("Cannot enable", "No stock left.");
    expect(mockUpdateStatus).toHaveBeenCalledTimes(0);
  });

  it("toggles status: calls updateMenuStatus and onToggle", async () => {
    const onToggle = jest.fn();

    const items: MenuItemAPI[] = [
      makeItem({ id: "i1", name: "Cheese", status: "DRAFT", leftoverQty: 5 }),
    ];

    mockUpdateStatus.mockResolvedValueOnce(undefined);

    const { getByLabelText } = render(
      <MenuList items={items} merchantId="m1" onToggle={onToggle} />
    );

    fireEvent(getByLabelText("Cheese-switch"), "valueChange", true);

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledTimes(1);
      expect(mockUpdateStatus).toHaveBeenCalledWith("m1", "i1", "LIVE");
    });

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("i1", true);
  });

  it("reverts UI and shows alert when updateMenuStatus fails", async () => {
    const items: MenuItemAPI[] = [
      makeItem({ id: "i1", name: "Cheese", status: "DRAFT", leftoverQty: 5 }),
    ];

    mockUpdateStatus.mockRejectedValueOnce(new Error("boom"));

    const { getByLabelText } = render(
      <MenuList items={items} merchantId="m1" />
    );

    fireEvent(getByLabelText("Cheese-switch"), "valueChange", true);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "boom");
    });

    // Optional: ensure the API was attempted once
    expect(mockUpdateStatus).toHaveBeenCalledTimes(1);
  });

  it("navigates to edit screen when edit button pressed (only id param now)", () => {
    const items: MenuItemAPI[] = [
      makeItem({ id: "i1", name: "Cheese", status: "LIVE" }),
    ];

    const { getByLabelText } = render(
      <MenuList items={items} merchantId="m1" />
    );

    fireEvent.press(getByLabelText("edit-Cheese"));

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/edit-item/[id]",
      params: { id: "i1" },
    });
  });

  it("delete flow: confirm -> calls DeleteMenuItem and onDelete", async () => {
    const onDelete = jest.fn();

    const items: MenuItemAPI[] = [
      makeItem({ id: "i1", name: "Cheese", status: "LIVE" }),
    ];

    mockDeleteMenuItem.mockResolvedValueOnce(undefined);

    // make Alert.alert immediately press "Delete"
    (Alert.alert as unknown as jest.Mock).mockImplementation(
      (_title: string, _msg: string, buttons?: any[]) => {
        const del = buttons?.find((b: any) => b.text === "Delete");
        del?.onPress?.();
      }
    );

    const { getByLabelText, queryByText } = render(
      <MenuList items={items} merchantId="m1" onDelete={onDelete} />
    );

    fireEvent.press(getByLabelText("delete-Cheese"));

    await waitFor(() => {
      expect(mockDeleteMenuItem).toHaveBeenCalledTimes(1);
      expect(mockDeleteMenuItem).toHaveBeenCalledWith("m1", "i1");
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("i1");

    // optimistic removal (item disappears)
    await waitFor(() => {
      expect(queryByText("Cheese")).toBeNull();
    });
  });

  it("delete flow: confirm -> shows error and restores item on failure", async () => {
    const items: MenuItemAPI[] = [
      makeItem({ id: "i1", name: "Cheese", status: "LIVE" }),
    ];

    mockDeleteMenuItem.mockRejectedValueOnce(new Error("delete failed"));

    (Alert.alert as unknown as jest.Mock).mockImplementation(
      (_title: string, _msg: string, buttons?: any[]) => {
        const del = buttons?.find((b: any) => b.text === "Delete");
        del?.onPress?.();
      }
    );

    const { getByLabelText, getByText } = render(
      <MenuList items={items} merchantId="m1" />
    );

    fireEvent.press(getByLabelText("delete-Cheese"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "delete failed");
    });

    // item should be restored after failure
    expect(getByText("Cheese")).toBeTruthy();
  });
});
