import ContentSwitcher from "@/components/Menu/Content-Switcher";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

const tabs = [
  { key: "items", label: "Items" },
  { key: "options", label: "Options" },
];

describe("ContentSwitcher", () => {
  it("renders and moves underline (static mode)", () => {
    const onChange = jest.fn();
    const { getByTestId, getByLabelText } = render(
      <ContentSwitcher
        tabs={tabs}
        value="items"
        onChange={onChange}
        animated={false}
        containerWidth={300}
        testID="switcher"
      />
    );
    fireEvent.press(getByLabelText("Options-tab"));
    expect(onChange).toHaveBeenCalledWith("options");
    const underline = getByTestId("switcher-underline");
    expect(underline.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 150 }),
      ])
    );
  });
});
