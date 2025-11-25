import React, { useState } from "react";
import { fireEvent, render } from "@testing-library/react-native";
import NumberStepper from "@/components/add-item/NumberStepper";

function Harness({ initial = 1 }) {
  const [value, setValue] = useState(initial);
  return <NumberStepper value={value} onChange={setValue} testID={""} />;
}

describe("NumberStepper", () => {
  it("increments and decrements with floor at 0", () => {
    const { getByLabelText, getByTestId } = render(<Harness initial={1} />);

    // +1 => 2
    fireEvent.press(getByLabelText("stepper-increment"));
    expect(getByTestId("stepper-value").props.children).toBe(2);

    // -1 => 1, -1 => 0, and another - should keep it at 0
    fireEvent.press(getByLabelText("stepper-decrement"));
    fireEvent.press(getByLabelText("stepper-decrement"));
    fireEvent.press(getByLabelText("stepper-decrement"));

    expect(getByTestId("stepper-value").props.children).toBe(0);
  });
});
