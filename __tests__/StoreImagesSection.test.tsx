// __tests__/StoreImagesSection.test.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import StoreImagesSection from "@/components/store/StoreImagesSection";

// Mock heroicons so we can assert fallback placeholders
jest.mock("react-native-heroicons/outline", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    PhotoIcon: (props: any) => (
      <Text testID="photo-icon">{`PhotoIcon-${props.size ?? ""}`}</Text>
    ),
  };
});

describe("StoreImagesSection", () => {
  it("renders titles + descriptions", () => {
    const { getByText } = render(
      <StoreImagesSection storeImage={null} listImage={null} />
    );

    expect(getByText("Store image")).toBeTruthy();
    expect(
      getByText("This is the image for the top of your store menu.")
    ).toBeTruthy();

    expect(getByText("List image")).toBeTruthy();
    expect(
      getByText(
        "This image will appear alongside other businesses when customers browse the restaurant list."
      )
    ).toBeTruthy();
  });

  it("renders PhotoIcon placeholders when no images provided", () => {
    const { getAllByTestId, UNSAFE_queryAllByType } = render(
      <StoreImagesSection storeImage={null} listImage={null} />
    );

    // 2 placeholders (store + list)
    expect(getAllByTestId("photo-icon")).toHaveLength(2);

    // No <Image /> should exist
    const { Image } = require("react-native");
    expect(UNSAFE_queryAllByType(Image)).toHaveLength(0);
  });

  it("renders Image components when storeImage and listImage are provided", () => {
    const storeUri = "file:///store.jpg";
    const listUri = "file:///list.jpg";

    const { queryAllByTestId, UNSAFE_getAllByType } = render(
      <StoreImagesSection storeImage={storeUri} listImage={listUri} />
    );

    // No placeholders
    expect(queryAllByTestId("photo-icon")).toHaveLength(0);

    // 2 Images rendered
    const { Image } = require("react-native");
    const images = UNSAFE_getAllByType(Image);
    expect(images).toHaveLength(2);

    // Validate sources (component order: store first, list second)
    expect(images[0].props.source).toEqual({ uri: storeUri });
    expect(images[1].props.source).toEqual({ uri: listUri });
  });

  it("renders one Image + one PhotoIcon when only one uri is provided", () => {
    const storeUri = "file:///store.jpg";

    const { UNSAFE_getAllByType, getAllByTestId } = render(
      <StoreImagesSection storeImage={storeUri} listImage={null} />
    );

    const { Image } = require("react-native");
    const images = UNSAFE_getAllByType(Image);
    expect(images).toHaveLength(1);
    expect(images[0].props.source).toEqual({ uri: storeUri });

    // One placeholder for list image
    expect(getAllByTestId("photo-icon")).toHaveLength(1);
  });
});
