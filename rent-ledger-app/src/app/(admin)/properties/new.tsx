import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { createProperty } from "@/services/properties";
import { CreatePropertyInput } from "@/types/property";
import { useRouter } from "expo-router";
import { useState } from "react";

//import { Text } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
} from "react-native";

export default function NewPropertyScreen() {
  //theme:
  const theme = useTheme();

  //state:
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Missing information", "Please enter name.");
      return;
    }

    try {
      setSaving(true);
      setError(undefined);

      const property: CreatePropertyInput = {
        name: name.trim(),
        address: address.trim() || null, // Can be a string or null
        notes: notes.trim() || null, // Can be null
      };
      //promise should be awaited before going forward
      await createProperty(property);
      Alert.alert("Property Saved", "Record saved successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to insert record.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen testID="new-property-screen">
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={[styles.title, { color: theme.text }]}>Add Property</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Enter details to add a new property
        </Text>

        <AppInput
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter property name"
        />

        <AppInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={styles.multilineInput}
        />
        <AppInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Enter notes"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={styles.multilineInput}
        />
        {error && <Text style={{ color: theme.danger }}>{error}</Text>}

        <AppButton onPress={handleSubmit} title="Submit" loading={saving} />
        <AppButton
          title="Cancel"
          variant="secondary"
          onPress={() => router.back()}
        />
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

  multilineInput: {
    minHeight: 90,
  },
});
