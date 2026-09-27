import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
} from "react-native";

export default function LoginScreen() {
  const theme = useTheme();

  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing information", "Please enter email and password.");
      return;
    }

    try {
      await signIn(email, password);
      router.replace("/");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      Alert.alert("Login failed", message);
    }
  };

  return (
    <Screen testID="login-screen">
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={[styles.title, { color: theme.text }]}>Rent Ledger</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Sign in to manage rent collection and approvals.
        </Text>

        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />
        <AppButton onPress={handleLogin} title="Login" loading={loading} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    marginBottom: Spacing.xl,
  },
});
