import ImagePickerField from "@/components/ImagePickerField";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import React from "react";

const localTestImagePath =
  "file:///Applications/Project/leftlovers-merchant-frontend/mockupData/GEISHA.jpeg";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({
    status: "granted",
  })),
  launchImageLibraryAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: localTestImagePath }],
  })),
}));

describe("ImagePickerField", () => {
  it("renders upload state and picks image", async () => {
    const onChange = jest.fn();
    const { getByText } = render(<ImagePickerField onChange={onChange} />);
    const uploadButton = getByText("Upload PNG/JPEG");
    expect(uploadButton).toBeTruthy();

    fireEvent.press(uploadButton);

    await waitFor(() => {
      // ให้ตรงกับที่คุณเทสต์ในเคส Replace (object { uri, name, type })
      expect(onChange).toHaveBeenCalledWith({
        uri: localTestImagePath,
        name: null,
        type: null,
      });
    });
  });

  it("renders preview state and supports Replace / Remove", async () => {
    const onChange = jest.fn();
    const existingPath = localTestImagePath;

    const { getByText, queryByText } = render(
      <ImagePickerField value={existingPath} onChange={onChange} />
    );
    expect(queryByText("Upload PNG/JPEG")).toBeNull();
    fireEvent.press(getByText("Replace"));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        uri: localTestImagePath,
        name: null,
        type: null,
      });
    });

    // Remove clears the image
    fireEvent.press(getByText("Remove"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("requests permission before picking", async () => {
    const spyPerm = jest.spyOn(
      ImagePicker,
      "requestMediaLibraryPermissionsAsync"
    );
    const { getByText } = render(<ImagePickerField onChange={() => {}} />);

    fireEvent.press(getByText("Upload PNG/JPEG"));
    await waitFor(() => expect(spyPerm).toHaveBeenCalled());
  });
});
