// __tests__/CuisineCertificationForm.test.tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import CuisineCertificationForm from "@/components/store/CuisineCertificationForm";

jest.mock("@/components/add-item/FieldLabel", () => {
  const React = require("react");
  const { Text, View } = require("react-native");
  return function FieldLabelMock(props: { label: string; required?: boolean }) {
    return (
      <View>
        <Text>
          {props.label}
          {props.required ? " *" : ""}
        </Text>
      </View>
    );
  };
});

type Category = { id: string; name: string };

const baseProps = (
  overrides?: Partial<React.ComponentProps<typeof CuisineCertificationForm>>
) => {
  const props: React.ComponentProps<typeof CuisineCertificationForm> = {
    categories: [],
    selectedCategoryId: "",
    setSelectedCategoryId: jest.fn(),
    canSave: false,
    saving: false,
    onSave: jest.fn(),
    error: null,
    bottomPadding: 0,
    ...overrides,
  };
  return props;
};

describe("CuisineCertificationForm", () => {
  it("renders error banner when error exists", () => {
    const { getByText } = render(
      <CuisineCertificationForm
        {...baseProps({ error: "Something went wrong" })}
      />
    );
    expect(getByText("Something went wrong")).toBeTruthy();
  });

  it("renders empty state when categories is empty", () => {
    const { getByText } = render(<CuisineCertificationForm {...baseProps()} />);
    expect(
      getByText("No categories configured. Please contact admin.")
    ).toBeTruthy();
  });

  it("renders list of categories, shows selected row, and calls setSelectedCategoryId", () => {
    const setSelectedCategoryId = jest.fn();
    const categories: Category[] = [
      { id: "c1", name: "Thai" },
      { id: "c2", name: "Japanese" },
      { id: "c3", name: "Italian" },
    ];

    const { getAllByText, getByText } = render(
      <CuisineCertificationForm
        {...baseProps({
          categories,
          selectedCategoryId: "c2",
          setSelectedCategoryId,
        })}
      />
    );

    // "Japanese" appears twice (display box + list row)
    expect(getAllByText("Japanese").length).toBeGreaterThan(1);

    // selected row should show "Selected"
    expect(getByText("Selected")).toBeTruthy();

    // pressing another category triggers setter
    fireEvent.press(getByText("Thai"));
    expect(setSelectedCategoryId).toHaveBeenCalledWith("c1");
  });

  it('renders "Select cuisine category" when none selected', () => {
    const categories: Category[] = [{ id: "c1", name: "Thai" }];

    const { getByText } = render(
      <CuisineCertificationForm
        {...baseProps({
          categories,
          selectedCategoryId: "",
        })}
      />
    );

    expect(getByText("Select cuisine category")).toBeTruthy();
  });

  it('renders certification "Verified" section', () => {
    const { getByText } = render(<CuisineCertificationForm {...baseProps()} />);
    expect(getByText("Certification status")).toBeTruthy();
    expect(getByText("Verified")).toBeTruthy();
  });

  it("save button respects canSave + calls onSave", () => {
    const onSave = jest.fn();

    const { getByLabelText, rerender } = render(
      <CuisineCertificationForm {...baseProps({ canSave: false, onSave })} />
    );

    const btn1 = getByLabelText("save-cuisine-certification");
    expect(btn1.props.accessibilityState?.disabled).toBe(true);

    rerender(<CuisineCertificationForm {...baseProps({ canSave: true, onSave })} />);

    const btn2 = getByLabelText("save-cuisine-certification");
    expect(btn2.props.accessibilityState?.disabled).toBe(false);

    fireEvent.press(btn2);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows "Saving..." when saving=true', () => {
    const { getByText } = render(
      <CuisineCertificationForm {...baseProps({ saving: true })} />
    );
    expect(getByText("Saving...")).toBeTruthy();
  });
});
