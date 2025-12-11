// components/Authen/DOBPicker.tsx
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, parse } from "date-fns";
import { FontAwesome } from "@expo/vector-icons";

type DobPickerHybridProps = {
  dob: string | undefined;
  setDob: (s: string) => void;
  minAge?: number;
  labelColor?: string;
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_MIN_AGE = 15;

export function DobPickerHybrid({
  dob,
  setDob,
  minAge = DEFAULT_MIN_AGE,
  labelColor = "#000",
  style,
}: DobPickerHybridProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(undefined);

  const openPicker = () => {
    if (dob) {
      const d = parseDisplayToDate(dob);
      if (d) {
        setTempDate(d);
      } else {
        setTempDate(new Date(2000, 0, 1));
      }
    } else {
      setTempDate(new Date(2000, 0, 1));
    }
    setShowDatePicker(true);
  };

  const onConfirm = () => {
    if (!tempDate) return;

    const now = new Date();
    if (tempDate > now) {
      Alert.alert("Age Restriction", "Date of birth cannot be in the future.");
      return;
    }
    if (calcAge(tempDate) < minAge) {
      Alert.alert("Age Restriction", `You must be at least ${minAge} years old.`);
      return;
    }

    setDob(formatAD(tempDate));
    setShowDatePicker(false);
  };

  return (
    <View style={[styles.container, style, { marginTop: 18, marginBottom: -6}]}>
      <Text className="font-poppins text-[15px]" style={{ marginBottom: 6 }}>
              Date of Birth
      </Text>
      <Pressable style={styles.box} onPress={openPicker}>
        <TextInput
          placeholder="dd/mm/yyyy"
          placeholderTextColor="#9CA3AF"
          value={dob}
          editable={false}
          pointerEvents="none"
          style={[
            styles.textInputInside,
            {
              color: dob ? "#000" : "#999",
              paddingTop: 0,
              paddingBottom: 0,
              textAlignVertical: "center", // for Android vertical centering
            },
          ]}
        />
        <View style={styles.iconWrapper}>
          <FontAwesome name="calendar" size={20} color={labelColor} />
        </View>
      </Pressable>

      {dob && (() => {
        const d = parseDisplayToDate(dob);
        if (!d) return null;
        return (
          <Text style={[styles.beHint, { fontFamily: "Poppins_400Regular" }]}>
            Thai year (BE): {formatBE(d)}
          </Text>
        );
      })()}

      <Modal
        transparent
        visible={showDatePicker}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={[styles.modalTitle, { fontFamily: "Poppins_600SemiBold" }]}>
              Select Date of Birth
            </Text>

            <DateTimePicker
              value={
                tempDate ??
                (dob ? parseDisplayToDate(dob) ?? new Date(2000, 0, 1) : new Date(2000, 0, 1))
              }
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(event: any, selected?: Date) => {
                if (Platform.OS === "android" && event?.type === "dismissed") {
                  setShowDatePicker(false);
                  return;
                }
                if (selected) {
                  setTempDate(selected);
                }
              }}
            />

            <View style={styles.previewContainer}>
              {(() => {
                const d =
                  tempDate ??
                  (dob ? parseDisplayToDate(dob) ?? new Date(2000, 0, 1) : new Date(2000, 0, 1));
                return (
                  <>
                    <Text style={[styles.previewText, { fontFamily: "Poppins_400Regular" }]}>
                      AD: {formatAD(d)}
                    </Text>
                    <Text style={[styles.previewTextBE, { fontFamily: "Poppins_400Regular" }]}>
                      BE: {formatBE(d)}
                    </Text>
                  </>
                );
              })()}
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={[styles.cancelText, { fontFamily: "Poppins_600SemiBold" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onConfirm}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <Text style={[styles.confirmText, { fontFamily: "Poppins_600SemiBold" }]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/** Helpers & Parsers **/

const isBEYear = (y: number) => y >= 2400;
const toADYear = (y: number) => (isBEYear(y) ? y - 543 : y);
const toBEYear = (y: number) => y + 543;
const pad2 = (n: number) => String(n).padStart(2, "0");

function formatAD(d: Date): string {
  return format(d, "dd/MM/yyyy");
}
function formatBE(d: Date): string {
  const beYear = toBEYear(d.getFullYear());
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  return `${dd}/${mm}/${beYear}`;
}
function parseDisplayToDate(s: string): Date | null {
  const trimmed = s.trim();
  const parsed = parse(trimmed, "dd/MM/yyyy", new Date());
  if (isNaN(parsed.getTime())) {
    return null;
  }
  const parts = trimmed.split("/");
  if (parts.length === 3) {
    const rawYear = Number(parts[2]);
    if (!isNaN(rawYear) && isBEYear(rawYear)) {
      const adYear = toADYear(rawYear);
      parsed.setFullYear(adYear);
    }
  }
  const dd = parsed.getDate();
  const mm = parsed.getMonth() + 1;
  const yyyy = parsed.getFullYear();
  const [pdd, pmm, pyyyy] = trimmed.split("/").map(Number);
  if (dd !== pdd || mm !== pmm || yyyy !== toADYear(pyyyy)) {
    return null;
  }
  return parsed;
}
function calcAge(d: Date): number {
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
    age--;
  }
  return age;
}
export function toBEStringForStorage(s: string): string {
  const d = parseDisplayToDate(s);
  if (!d) return "";
  return formatBE(d);
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: 15,
    marginBottom: 4,
    color: "#000000ff",
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(38, 189, 104, 0.2)",
    borderWidth: 0.5,
    borderColor: "rgba(38, 189, 104, 0.05)",
    borderRadius: 8,
    padding: 12,
  },
  textInputInside: {
    flex: 1,
    fontSize: 15,
  },
  iconWrapper: {
    marginLeft: 8,
  },
  beHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontWeight: "600",
    fontSize: 20,
    marginBottom: 8,
  },
  previewContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  previewText: {
    fontSize: 13,
    color: "#111827",
  },
  previewTextBE: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: "#26BD68",
  },
  cancelText: {
    color: "#111827",
  },
  confirmText: {
    color: "white",
    fontWeight: "600",
  },
});
