import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleSheet,
  Text,
} from "react-native";

type AppButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

export function AppButton({
  title,
  loading = false,
  disabled,
  variant = "primary",
  style,
  ...rest
}: AppButtonProps) {
  const theme = useTheme();

  //TypeScript clarity, because disabled can technically be undefined, so use !! as it converts: undefined → false, true → true, false → false
  const isDisabled = loading || !!disabled;

  // Inside your component:
  const getDynamicStyles = (state: PressableStateCallbackType) => {
    let variantStyles = {};

    if (variant === "secondary") {
      variantStyles = {
        backgroundColor: theme.surface,
        borderWidth: 1, // Ensure a border width is set to see the color
        borderColor: theme.border, // Or whatever your disabled border looks like
      };
    } // Default: primary variant
    else
      variantStyles = {
        backgroundColor: theme.primary,
        borderColor: theme.border,
        borderWidth: 1,
      };

    return [
      variantStyles,
      isDisabled && styles.buttonDisabled,
      state.pressed && !isDisabled && styles.buttonPressed,
      typeof style === "function" ? style(state) : style,
    ];
  };

  const contentColor = variant === "secondary" ? theme.text : theme.primaryText;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      style={(state) => [styles.button, ...getDynamicStyles(state)]}
    >
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            {
              color: contentColor,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.sm,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "700",
  },
  buttonDisabled: { borderColor: "transparent", opacity: 0.3 },
  buttonPressed: { opacity: 0.7 },
});
