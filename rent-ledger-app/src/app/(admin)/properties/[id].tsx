import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  getProperty,
  setPropertyActive,
  updateProperty,
} from "@/services/properties";
import { UpdatePropertyInput } from "@/types/property";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
  Text,
} from "react-native";

export default function EditPropertyScreen() {
  //theme:
  const theme = useTheme();

  //state:
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setActive] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  async function loadProperty() {
    try {
      setLoading(true);
      setError(undefined);

      const data = await getProperty(id);

      setName(data.name);
      setAddress(data.address ?? "");
      setNotes(data.notes ?? "");
      setActive(data.is_active);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load record.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  //Load the property initially, and if the route's property ID ever changes, load the new property.
  useEffect(() => {
    loadProperty();
  }, [id]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Missing information", "Please enter name.");
      return;
    }

    try {
      setSaving(true);
      setError(undefined);

      const property: UpdatePropertyInput = {
        name: name.trim(),
        address: address.trim() || null, // Can be a string or null
        notes: notes.trim() || null, // Can be null
      };
      //promise should be awaited before going forward
      await updateProperty(id, property);
      Alert.alert("Property Saved", "Record saved successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update property.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleActiveStatus = async (nextActiveStatus: boolean) => {
    try {
      setStatusSaving(true);
      setError(undefined);

      //promise should be awaited before going forward
      await setPropertyActive(id, nextActiveStatus);
      setActive(nextActiveStatus); // 2. Update screen layout state
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to update property status.";
      setError(message);
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <Text style={[styles.title, { color: theme.text }]}>
          Loading property...
        </Text>
        <ActivityIndicator color={theme.primary} />
      </Screen>
    );
  }

  //checking both error and empty names to ensure that loading property has failed
  if (error && !name) {
    return (
      <Screen>
        <Text style={{ color: theme.danger }}>{error}</Text>
        <AppButton title="Go Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen testID="edit-property-screen">
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={[styles.title, { color: theme.text }]}>Edit Property</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Modify details of existing property
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
        <Text style={[styles.label, { color: theme.text }]}>
          Status: {isActive ? "Active" : "Inactive"}
        </Text>
        <Switch
          trackColor={{ false: theme.disabled, true: theme.primary }}
          thumbColor={isActive ? theme.primaryText : theme.surface}
          disabled={statusSaving || saving}
          onValueChange={(nextStatus) => {
            Alert.alert(
              nextStatus
                ? "Activate this property?"
                : "Deactivate this property?",
              "The property will remain in the system and its historical records will be preserved.",
              [
                {
                  text: nextStatus ? "Activate" : "Deactivate",
                  onPress: () => {
                    handleActiveStatus(nextStatus); // 3. Pass explicit truth to DB function
                  },
                },
                {
                  text: "Cancel",
                  style: "cancel",
                },
              ],
            );
          }} // Fires when the user taps or drags the toggle
          value={isActive}
        />

        {error && <Text style={{ color: theme.danger }}>{error}</Text>}

        <AppButton
          onPress={handleSubmit}
          title="Save Changes"
          loading={saving}
          disabled={statusSaving}
        />
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
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },

  multilineInput: {
    minHeight: 90,
  },
});
