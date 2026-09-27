import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { StyleSheet, Text, TextInput, TextInputProps } from "react-native";

type AppInputProps = TextInputProps & {
  label: string;
};

export function AppInput({
  label,
  style,
  placeholderTextColor,
  ...rest
}: AppInputProps) {
  const theme = useTheme();
  return (
    <>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        {...rest}
        placeholderTextColor={placeholderTextColor ?? theme.textSecondary}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
          style,
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
});
