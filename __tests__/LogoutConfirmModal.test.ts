// __tests__/LogoutConfirmModal.test.ts

jest.doMock("react-native-safe-area-context", () => {
  const React = require("react");
  const RN = require("react-native");

  return {
    __esModule: true,
    SafeAreaProvider: ({ children }: { children: any }) => children,
    SafeAreaView: ({ children, ...props }: any) =>
      React.createElement(RN.View, props, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.doMock("react-native/Libraries/Modal/Modal", () => {
  const React = require("react");

  function MockModal({ visible, children }: any) {
    if (!visible) return null;
    return React.createElement(React.Fragment, null, children);
  }

  return {
    __esModule: true,
    default: MockModal,
  };
});

const React = require("react");
const { render, fireEvent } = require("@testing-library/react-native");
const LogoutConfirmModal =
  require("@/components/store/LogoutConfirmModal").default;

function renderModal(overrides?: Partial<{
  visible: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}>) {
  const onCancel = overrides?.onCancel ?? jest.fn();
  const onConfirm = overrides?.onConfirm ?? jest.fn();

  const utils = render(
    React.createElement(LogoutConfirmModal, {
      visible: overrides?.visible ?? true,
      onCancel,
      onConfirm,
      loading: overrides?.loading ?? false,
    })
  );

  // Walk up the tree to find the nearest Pressable-like host:
  // - In RN testing tree, Text may be wrapped by Views, so parent isn't always the Pressable.
  const getNearestPressableFrom = (node: any) => {
    let cur = node;
    while (cur) {
      const p = cur.parent;
      if (!p) break;

      // "Pressable-ish": has onPress OR has accessibilityRole=button
      const props = p.props ?? {};
      if (typeof props.onPress === "function" || props.accessibilityRole === "button") {
        return p;
      }
      cur = p;
    }
    // fallback: return direct parent
    return node.parent;
  };

  const getPressableByText = (label: string) => {
    const textNode = utils.getByText(label);
    const pressable = getNearestPressableFrom(textNode);
    if (!pressable) throw new Error(`No pressable found for "${label}"`);
    return pressable;
  };

  const pressByText = (label: string) => {
    const pressable = getPressableByText(label);
    fireEvent.press(pressable);
    return pressable;
  };

  return { ...utils, onCancel, onConfirm, getPressableByText, pressByText };
}

describe("LogoutConfirmModal", () => {
  it("renders content when visible", () => {
    const { getByText } = renderModal({ visible: true });

    expect(getByText("Log out?")).toBeTruthy();
    expect(
      getByText("You will be logged out of this account on this device.")
    ).toBeTruthy();

    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Log out")).toBeTruthy();
  });

  it("renders nothing when not visible", () => {
    const { queryByText } = renderModal({ visible: false });

    expect(queryByText("Log out?")).toBeNull();
    expect(queryByText("Cancel")).toBeNull();
    expect(queryByText("Log out")).toBeNull();
  });

  it("calls onCancel when Cancel is pressed", () => {
    const { onCancel, pressByText } = renderModal({ visible: true });

    pressByText("Cancel");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when Log out is pressed", () => {
    const { onConfirm, pressByText } = renderModal({ visible: true });

    pressByText("Log out");
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("when loading=true: disables buttons and shows 'Logging out...'", () => {
    const { getByText, getPressableByText } = renderModal({
      visible: true,
      loading: true,
    });

    expect(getByText("Logging out...")).toBeTruthy();

    const cancelBtn = getPressableByText("Cancel");
    const logoutBtn = getPressableByText("Logging out...");

    // ✅ Disabled can be on Pressable props
    expect(cancelBtn.props.disabled).toBe(true);
    expect(logoutBtn.props.disabled).toBe(true);
  });
});
