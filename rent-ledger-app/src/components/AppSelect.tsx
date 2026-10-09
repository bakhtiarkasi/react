import { FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from "react-native";

type SelectOption<T extends string> = {
  label: string;
  value: T;
};

type AppSelectProps<T extends string> = PressableProps & {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  options: SelectOption<T>[];
  value: T | "";
  onValueChange: (value: T) => void; //this is a callback function with no return type (void)
};

export function AppSelect<T extends string>({
  label,
  loading = false,
  disabled = false,
  options,
  value,
  onValueChange,
  style,
  ...rest
}: AppSelectProps<T>) {
  const theme = useTheme();

  const [modalVisible, setModalVisible] = useState(false);

  //TypeScript clarity, because disabled can technically be undefined, so use !! as it converts: undefined → false, true → true, false → false
  const isDisabled = loading || !!disabled;

  // Inside your component:
  const getDynamicStyles = (state: PressableStateCallbackType) => {
    return [
      {
        backgroundColor: theme.surface,
        borderWidth: 1, // Ensure a border width is set to see the color
        borderColor: theme.border, // Or whatever your disabled border looks like
      },
      isDisabled && styles.selectDisabled,
      typeof style === "function" ? style(state) : style,
    ];
  };

  const handleSelect = (item: SelectOption<T>) => {
    onValueChange(item.value);
    setModalVisible(false); // Close dropdown after selection
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <Pressable
        {...rest}
        disabled={isDisabled}
        onPress={() => setModalVisible(true)} // Open the modal on press
        style={(state) => [styles.dropdownTrigger, ...getDynamicStyles(state)]}
      >
        {loading ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <>
            <Text
              style={[
                {
                  color: theme.text,
                },
              ]}
            >
              {selectedOption ? selectedOption.label : "Choose an item..."}
            </Text>
            <Text
              style={[styles.selectOptionText, { color: theme.textSecondary }]}
            >
              ▼
            </Text>
          </>
        )}
      </Pressable>

      {/* 2. Dropdown List Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)} // Android hardware back button support
      >
        {/* Backdrop overlay: tapping it closes the modal */}
        <Pressable
          style={[
            styles.modalOverlay,
            {
              backgroundColor: `${theme.surface}80`,
            },
          ]}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.primary }]}
          >
            <Text
              style={[styles.selectOptionText, { color: theme.primaryText }]}
            >
              Select Options
            </Text>
            {/* 3. Dropdown Options List */}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: theme.primary,
                    },
                    value === item.value && {
                      backgroundColor: theme.surface,
                      //opacity: 0.5,
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.listText,
                      { color: theme.primaryText },
                      value === item.value && { color: theme.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  dropdownTrigger: {
    paddingVertical: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  selectOptionText: {
    fontWeight: "700",
  },
  listItem: {
    flexDirection: "column",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  listText: {
    fontSize: FontSize.sm,
  },

  modalOverlay: {
    flex: 1,
    // opacity: 0.3, // Dimmed background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: Radius.md,
    padding: Spacing.md,
    maxHeight: "50%", // Prevents list from overflowing screen limits
    elevation: 5,
  },

  selectDisabled: { borderColor: "transparent", opacity: 0.3 },
});
