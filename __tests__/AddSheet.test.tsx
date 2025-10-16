import AddSheet from "@/components/Menu/AddSheet";
import React from "react";
import renderer from "react-test-renderer";

describe("<AddSheet />", () => {
  const mockClose = jest.fn();
  const mockAddItem = jest.fn();
  const mockAddOption = jest.fn();

  it("renders correctly when visible", () => {
    const tree = renderer
      .create(<AddSheet visible={true} onClose={mockClose} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with all props", () => {
    const tree = renderer
      .create(
        <AddSheet
          visible={true}
          onClose={mockClose}
          onAddItem={mockAddItem}
          onAddOption={mockAddOption}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
