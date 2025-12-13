import UploadImagesGrid from "@/components/Authen/UploadImages";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

type SimpleAsset = { name: string; uri: string };

function renderGrid(
  overrides?: Partial<React.ComponentProps<typeof UploadImagesGrid>>
) {
  const onAdd = jest.fn();
  const onRemove = jest.fn();

  const files: SimpleAsset[] =
    overrides?.files ?? [
      { name: "a.jpg", uri: "file:///a.jpg" },
      { name: "b.jpg", uri: "file:///b.jpg" },
    ];

  const utils = render(
    <UploadImagesGrid
      title="Store Images"
      required
      files={files}
      max={5}
      onAdd={onAdd}
      onRemove={onRemove}
      {...overrides}
    />
  );

  return { ...utils, onAdd, onRemove, files };
}

describe("UploadImagesGrid", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders header with count (count/max) and required star", () => {
    const { getByText } = renderGrid({
      files: [{ name: "a.jpg", uri: "file:///a.jpg" }],
      max: 5,
    });

    expect(getByText(/Store Images/)).toBeTruthy();
    expect(getByText(/\(1\/5\)/)).toBeTruthy();
    expect(getByText(/\*/)).toBeTruthy();
  });

  it("does not render required star when required=false", () => {
    const { getByText, queryByText } = renderGrid({
      required: false,
      files: [{ name: "a.jpg", uri: "file:///a.jpg" }],
      max: 5,
    });

    expect(getByText(/Store Images/)).toBeTruthy();
    expect(getByText(/\(1\/5\)/)).toBeTruthy();
    expect(queryByText(/\*/)).toBeNull();
  });

  it("renders index badges when files exist", () => {
    const { getByText } = renderGrid({
      files: [
        { name: "a.jpg", uri: "file:///a.jpg" },
        { name: "b.jpg", uri: "file:///b.jpg" },
        { name: "c.jpg", uri: "file:///c.jpg" },
      ],
      max: 5,
    });

    expect(getByText("1")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
  });

  it("calls onRemove with correct index when pressing ✕", () => {
    const { getAllByText, onRemove } = renderGrid({
      files: [
        { name: "a.jpg", uri: "file:///a.jpg" },
        { name: "b.jpg", uri: "file:///b.jpg" },
      ],
      max: 5,
    });

    const removeButtons = getAllByText("✕");
    fireEvent.press(removeButtons[1]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it("calls onAdd when count < max", () => {
    const { getByText, onAdd } = renderGrid({
      files: [{ name: "a.jpg", uri: "file:///a.jpg" }],
      max: 5,
    });

    fireEvent.press(getByText("Add more images"));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("shows Upload Images when count=0 and calls onAdd", () => {
    const { getByText, onAdd } = renderGrid({ files: [], max: 5 });

    fireEvent.press(getByText("Upload Images"));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("disables add button when count >= max", () => {
  const files = [
    { name: "1.jpg", uri: "file:///1.jpg" },
    { name: "2.jpg", uri: "file:///2.jpg" },
    { name: "3.jpg", uri: "file:///3.jpg" },
  ];

  const { getByText } = renderGrid({ files, max: 3 });

  const addLabel = getByText("Maximum reached");
  expect(addLabel).toBeTruthy();

  let node: any = addLabel;
  while (node && node.parent && node.props?.onPress === undefined && node.props?.disabled === undefined) {
    node = node.parent;
  }
  expect(node.props.disabled).toBe(true);  
  });
});