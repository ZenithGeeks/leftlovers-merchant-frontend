import FoodTypePicker, { FoodType } from "@/components/Authen/menuType"; // ✅ ปรับ path ให้ตรงโปรเจกต์
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

// ✅ Mock Modal แบบ default export (กัน undefined/displayName)
jest.mock("react-native/Libraries/Modal/Modal", () => {
  const React = require("react");
  const { View } = require("react-native");

  const MockModal = ({ visible, children }: any) => {
    return visible ? <View testID="modal">{children}</View> : null;
  };

  return { __esModule: true, default: MockModal };
});

// ✅ Mock Picker (named export) + ทำให้ Picker.Item กดได้ในเทส
jest.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const { View, Pressable, Text } = require("react-native");

  const Item = (_props: any) => null;

  const Picker = ({ selectedValue, onValueChange, children }: any) => {
    const items = React.Children.toArray(children).filter(Boolean);
    return (
      <View testID="mock-picker" accessibilityLabel={`selected:${selectedValue}`}>
        {items.map((el: any) => {
          const { label, value } = el.props;
          return (
            <Pressable
              key={String(value)}
              testID={`picker-item-${String(value)}`}
              onPress={() => onValueChange(value)}
            >
              <Text>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  Picker.Item = Item;

  return { __esModule: true, Picker };
});

const OPTIONS: FoodType[] = [
  { id: "1", label: "Thai" },
  { id: "2", label: "Japanese" },
  { id: "3", label: "Dessert" },
];

// helper: กด element ที่เป็น Text แล้วไต่ขึ้นไปหา Pressable ที่มี onPress
function pressNearestPressable(node: any) {
  let cur = node;
  while (cur && !cur.props?.onPress) cur = cur.parent;
  if (!cur) throw new Error("No parent with onPress found");
  fireEvent.press(cur);
}

// helper: หา parent ที่มี prop disabled (Pressable trigger)
function findPressableWithDisabled(fromNode: any) {
  let node = fromNode;
  while (node && node.parent && node.props?.disabled === undefined) {
    node = node.parent;
  }
  if (!node || node.props?.disabled === undefined) {
    throw new Error("Could not find a parent with 'disabled' prop");
  }
  return node;
}

describe("FoodTypePicker", () => {
  it("renders placeholder when value is null", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <FoodTypePicker value={null} onChange={onChange} options={OPTIONS} />
    );

    expect(getByText("Select a food type")).toBeTruthy();
  });

  it("renders selected badge when value exists", () => {
    const onChange = jest.fn();
    const { getByText, queryByText } = render(
      <FoodTypePicker value={OPTIONS[0]} onChange={onChange} options={OPTIONS} />
    );

    expect(getByText("Thai")).toBeTruthy();
    expect(queryByText("Select a food type")).toBeNull();
  });

  it("opens modal when pressing trigger", () => {
    const onChange = jest.fn();
    const { getByText, queryByText, queryByTestId } = render(
      <FoodTypePicker value={null} onChange={onChange} options={OPTIONS} />
    );

    pressNearestPressable(getByText("Select a food type"));
    expect(getByText("Select food type")).toBeTruthy();
    expect(getByText("Done")).toBeTruthy();
    expect(queryByTestId("modal")).toBeTruthy();
    expect(queryByText("Select food type")).not.toBeNull();
  });


  it("selects an option then Done -> calls onChange and closes modal", () => {
    const onChange = jest.fn();
    const { getByText, queryByText } = render(
      <FoodTypePicker value={null} onChange={onChange} options={OPTIONS} />
    );

    pressNearestPressable(getByText("Select a food type"));
    fireEvent.press(getByText("Japanese"));
    fireEvent.press(getByText("Done"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ id: "2", label: "Japanese" });
    expect(queryByText("Select food type")).toBeNull();
  });

  it("pressing Done without selecting (tempValue null) does not call onChange but closes modal", () => {
    const onChange = jest.fn();
    const { getByText, queryByText } = render(
      <FoodTypePicker value={null} onChange={onChange} options={OPTIONS} />
    );

    pressNearestPressable(getByText("Select a food type"));
    fireEvent.press(getByText("Done"));

    expect(onChange).not.toHaveBeenCalled();
    expect(queryByText("Select food type")).toBeNull();
  });

  // ✅ FIX: อย่ากดตอน disabled ให้ assert props.disabled แทน
  it("disabled prevents opening modal", () => {
    const onChange = jest.fn();
    const { getByText, queryByText } = render(
      <FoodTypePicker value={null} onChange={onChange} options={OPTIONS} disabled />
    );

    const labelNode = getByText("Select a food type");
    const trigger = findPressableWithDisabled(labelNode);

    expect(trigger.props.disabled).toBe(true);
    expect(queryByText("Select food type")).toBeNull();
  });

  it("shows errorText when provided", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <FoodTypePicker
        value={null}
        onChange={onChange}
        options={OPTIONS}
        errorText="Food type is required"
      />
    );

    expect(getByText("Food type is required")).toBeTruthy();
  });

  // ✅ FIX: Text ซ้อนกัน -> ใช้ regex
  it("label as string + required=true shows *", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <FoodTypePicker
        value={null}
        onChange={onChange}
        options={OPTIONS}
        label="Menu type"
        required
      />
    );

    expect(getByText(/Menu type\s*\*/)).toBeTruthy();
  });
});