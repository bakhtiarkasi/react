import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ReactNode } from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenProps = ViewProps & {
  children: ReactNode;
  scrollable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scrollable = false,
  style,
  contentStyle,
  ...rest
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        styles.screen,
        style,
      ]}
    >
      {scrollable ? (
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {
              backgroundColor: theme.background,
            },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.background,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flexGrow: 1, //flexGrow: 1 means fill the screen when content is short AND grow beyond the screen when content is long
    alignSelf: "center",
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.lg,
  },
});
