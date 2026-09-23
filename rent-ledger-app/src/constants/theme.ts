/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";
/*
export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
  },
} as const;
*/

/*
https://material-foundation.github.io/material-theme-builder/
background: The main app background (use white or black).
surface: Used for cards, panels, and containers that sit on top of the background (M3: surface)
text: Primary text color (titles, names and main content; M3: onSurface)
textSecondary: For less important text (Descriptions, Subtitles; M3: on Surface var)
primary: Your brand/action color (Buttons, Active tabs; M3: primary)
primaryText: Text shown on a primary-colored element; M3: onPrimary)
border: Used for separators and outlines (M3: outline).
disabled: For things users can't interact with. (Disabled buttons, Disabled textfield, M3: onSurface with 38% opacity, i.e 0.38 × 255 ≈ 97 97 decimal is approximately hexadecimal: 61 so put 61 in end)
success: Positive actions and confirmations (Saved successfull, #16A34A)
warning: Something needs attention but isn't an error (Low battery, #D97706)
danger: Errors, destructive actions, failures (Delete Account, M3: error)
*/
export const Colors = {
  light: {
    background: "#ffffff",
    surface: "#faf8ff",
    text: "#000000",
    // textSecondary: "#000000",
    textSecondary: "#475569",
    primary: "#00266e",
    primaryText: "#ffffff",
    border: "#282c39",
    disabled: "#00000061",
    success: "#16A34A",
    warning: "#D97706",
    danger: "#600004",
  },

  dark: {
    background: "#111827",
    surface: "#11131b",
    text: "#ffffff",
    //textSecondary: "#ffffff",
    textSecondary: "#CBD5E1",
    primary: "#edefff",
    primaryText: "#000000",
    border: "#edefff",
    disabled: "#ffffff61",
    success: "#16A34A",
    warning: "#D97706",
    danger: "#FFECE9",
  },
} as const;

//ThemeColor can only be a key that exists in both the light and dark themes.
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const FontSize = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 32,
} as const;

export const Spacing = {
  xsm: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
