// __tests__/Authen/LocationPicker.test.tsx
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import * as Location from "expo-location";
import React from "react";
import { Alert } from "react-native";

import LocationPicker from "@/components/Authen/LocationPicker"; // ✅ ปรับ path ให้ตรงโปรเจกต์ออม

// --------------------
// Mocks
// --------------------
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");

  const SafeAreaView = ({ children }: any) => <View>{children}</View>;
  SafeAreaView.displayName = "MockSafeAreaView";

  const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });

  return {
    SafeAreaView,
    useSafeAreaInsets,
  };
});

// Mock MapView + Marker to simple Views that still accept events
jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");

  const MapViewInner = (props: any, ref: any) => {
    const animateToRegion = jest.fn();
    React.useImperativeHandle(ref, () => ({ animateToRegion }));
    return (
      <View testID="map" {...props}>
        {props.children}
      </View>
    );
  };

  const MapView = React.forwardRef(MapViewInner);
  MapView.displayName = "MockMapView";

  const Marker = (props: any) => <View testID="marker" {...props} />;
  Marker.displayName = "MockMarker";

  return { __esModule: true, default: MapView, Marker };
});

describe("LocationPicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const setup = (props?: Partial<React.ComponentProps<typeof LocationPicker>>) => {
    const onChange = jest.fn();
    const ui = render(
      <LocationPicker
        lat=""
        lng=""
        onChange={onChange}
        {...props}
      />
    );
    return { ...ui, onChange };
  };

  it("opens and closes the modal", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const { getByText, queryByText } = setup();

    // open
    fireEvent.press(getByText("📍"));
    expect(getByText("Pin your store location")).toBeTruthy();

    // close by confirm
    fireEvent.press(getByText("Confirm Location"));
    await waitFor(() => {
      expect(queryByText("Pin your store location")).toBeNull();
    });
  });

  it("requests permission and uses current position to set initial marker when lat/lng empty", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 1.23, longitude: 4.56 },
    });

    const { getByText, getByTestId } = setup();

    // open modal so map/marker render
    fireEvent.press(getByText("📍"));

    await waitFor(() => {
      const marker = getByTestId("marker");
      expect(marker.props.coordinate.latitude).toBeCloseTo(1.23);
      expect(marker.props.coordinate.longitude).toBeCloseTo(4.56);
    });
  });

  it("tap on map calls onChange with 6-decimal strings", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const { getByText, getByTestId, onChange } = setup();

    fireEvent.press(getByText("📍"));

    fireEvent(getByTestId("map"), "onPress", {
      nativeEvent: { coordinate: { latitude: 13.12345678, longitude: 100.98765432 } },
    });

    expect(onChange).toHaveBeenCalledWith("13.123457", "100.987654");
  });

  it("drag marker calls onChange with 6-decimal strings", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const { getByText, getByTestId, onChange } = setup();

    fireEvent.press(getByText("📍"));

    fireEvent(getByTestId("marker"), "onDragEnd", {
      nativeEvent: { coordinate: { latitude: 10.5, longitude: 20.25 } },
    });

    expect(onChange).toHaveBeenCalledWith("10.500000", "20.250000");
  });

  it("search debounces, shows suggestions, and selecting one calls onChange", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => [
        { display_name: "Bangkok, Thailand", lat: "13.7563", lon: "100.5018" },
      ],
    });

    const { getByText, getByPlaceholderText, queryByText, onChange } = setup();

    fireEvent.press(getByText("📍"));

    const input = getByPlaceholderText("Search a place or address…");
    fireEvent.changeText(input, "Bangkok");

    // debounce 300ms
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(getByText("Bangkok, Thailand")).toBeTruthy();
    });

    fireEvent.press(getByText("Bangkok, Thailand"));

    expect(onChange).toHaveBeenCalledWith("13.756300", "100.501800");

    // suggestions cleared
    await waitFor(() => {
      expect(queryByText("Bangkok, Thailand")).toBeNull();
    });
  });

  it("Use my current location calls onChange, and shows Alert on failure", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    // success
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: 7.1, longitude: 99.2 },
    });

    const { getByText, onChange } = setup();
    fireEvent.press(getByText("📍"));

    fireEvent.press(getByText("Use my current location"));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("7.100000", "99.200000");
    });

    // failure
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(new Error("nope"));

    fireEvent.press(getByText("Use my current location"));
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Location",
        "Unable to fetch your current location."
      );
    });

    alertSpy.mockRestore();
  });

  it("shows invalid location error when lat/lng out of range", () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const { getByText } = setup({ lat: "200", lng: "0" });
    expect(getByText("Please pick a valid location.")).toBeTruthy();
  });
});
