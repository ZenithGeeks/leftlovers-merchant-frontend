import UploadFile from "@/components/Authen/UploadFile";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

jest.mock("react-native/Libraries/Linking/Linking", () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));

type FileAsset = {
  name: string;
  uri: string;
  mimeType?: string | null;
  size?: number | null;
};

const makeFile = (overrides: Partial<FileAsset> = {}): FileAsset => ({
  name: "file.pdf",
  uri: "file:///tmp/file.pdf",
  mimeType: "application/pdf",
  size: 123,
  ...overrides,
});

describe("UploadFile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and empty state (no file) and calls onPick", () => {
    const onPick = jest.fn();

    const { getByText, queryByText } = render(
      <UploadFile label="Commercial Registration *" onPick={onPick} />
    );

    // label
    expect(getByText("Commercial Registration *")).toBeTruthy();

    // empty card
    expect(getByText("Upload")).toBeTruthy();
    expect(queryByText("Replace")).toBeNull();
    expect(queryByText("Remove")).toBeNull();

    fireEvent.press(getByText("Upload"));
    expect(onPick).toHaveBeenCalledTimes(1);
  });

  it("uses custom emptyText", () => {
    const onPick = jest.fn();
    const { getByText } = render(
      <UploadFile label="Doc" onPick={onPick} emptyText="Tap to upload" />
    );

    expect(getByText("Tap to upload")).toBeTruthy();
    fireEvent.press(getByText("Tap to upload"));
    expect(onPick).toHaveBeenCalledTimes(1);
  });

  it("shows image preview when file is image by mimeType", () => {
    const onPick = jest.fn();
    const file = makeFile({
      name: "photo.jpg",
      uri: "file:///tmp/photo.jpg",
      mimeType: "image/jpeg",
    });

    const { UNSAFE_getByType, getByText, queryByText } = render(
      <UploadFile label="Photo" file={file} onPick={onPick} />
    );

    // Image component should exist
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    expect(UNSAFE_getByType(require("react-native").Image)).toBeTruthy();

    // No "Open PDF" button
    expect(queryByText("Open PDF")).toBeNull();

    // file card name shown
    expect(getByText("photo.jpg")).toBeTruthy();
    expect(getByText("Replace")).toBeTruthy();
  });

  it("shows image preview when file is image by extension (mimeType missing)", () => {
    const onPick = jest.fn();
    const file = makeFile({
      name: "photo.HEIC",
      uri: "file:///tmp/photo.HEIC",
      mimeType: null,
    });

    const { UNSAFE_getByType } = render(
      <UploadFile label="Photo" file={file} onPick={onPick} />
    );

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    expect(UNSAFE_getByType(require("react-native").Image)).toBeTruthy();
  });
  
  it("shows generic file preview for non-image/non-pdf", () => {
    const onPick = jest.fn();
    const file = makeFile({
      name: "notes.txt",
      mimeType: "text/plain",
      uri: "file:///tmp/notes.txt",
    });

    const { getByText, queryByText } = render(
      <UploadFile label="Any" file={file} onPick={onPick} />
    );

    expect(getByText("notes.txt")).toBeTruthy();
    expect(queryByText("Open PDF")).toBeNull();
  });

  it("calls onClear when pressing Remove", () => {
    const onPick = jest.fn();
    const onClear = jest.fn();
    const file = makeFile({ name: "doc.pdf" });

    const { getByText } = render(
      <UploadFile label="PDF" file={file} onPick={onPick} onClear={onClear} />
    );

    fireEvent.press(getByText("Remove"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("does not render Remove button if onClear is not provided", () => {
    const onPick = jest.fn();
    const file = makeFile({ name: "doc.pdf" });

    const { queryByText } = render(
      <UploadFile label="PDF" file={file} onPick={onPick} />
    );

    expect(queryByText("Remove")).toBeNull();
  });

  it("calls onPick when pressing Replace (file exists)", () => {
    const onPick = jest.fn();
    const file = makeFile({ name: "doc.pdf" });

    const { getByText } = render(
      <UploadFile label="PDF" file={file} onPick={onPick} />
    );

    fireEvent.press(getByText("Replace"));
    expect(onPick).toHaveBeenCalledTimes(1);
  });
});
