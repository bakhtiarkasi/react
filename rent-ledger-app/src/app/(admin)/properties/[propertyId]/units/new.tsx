import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { AppSelect } from "@/components/AppSelect";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { createUnit } from "@/services/units";
import { CreateUnitInput, UnitType, unitTypeOptions } from "@/types/units";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
} from "react-native";

export default function NewUnitScreen() {
  //theme:
  const theme = useTheme();

  //state:
  const [unitCode, setUnitCode] = useState<string>("");
  const [unitType, setUnitType] = useState<UnitType | "">("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();

  const router = useRouter();

  const handleSubmit = async () => {
    if (!unitCode.trim()) {
      Alert.alert("Missing information", "Please enter unit code.");
      return;
    }
    if (!unitType.trim()) {
      Alert.alert("Missing information", "Please select unit type.");
      return;
    }

    try {
      setSaving(true);
      setError(undefined);

      const unit: CreateUnitInput = {
        property_id: propertyId,
        unit_code: unitCode.trim(),
        unit_type: unitType as UnitType,
        description: description.trim() || null, // Can be a string or null
      };
      //promise should be awaited before going forward
      await createUnit(unit);
      Alert.alert("Unit Saved", "Record saved successfully", [
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
    <Screen testID="new-unit-screen">
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={[styles.title, { color: theme.text }]}>Add Unit</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Enter details to add a new unit
        </Text>

        <AppInput
          label="Unit Code"
          value={unitCode}
          onChangeText={setUnitCode}
          placeholder="Enter unit code"
        />

        <AppSelect
          label="Unit Type"
          value={unitType}
          options={unitTypeOptions}
          onValueChange={setUnitType}
        />

        {/* <AppSelect
          label="Operational Status"
          value={opStatus}
          options={unitOSOptions}
          onValueChange={(newValue) => {
            // newValue is safely inferred as UnitType automatically!
            setOpStatus(newValue as UnitOperationalStatus);
          }}
        /> */}

        <AppInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
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
