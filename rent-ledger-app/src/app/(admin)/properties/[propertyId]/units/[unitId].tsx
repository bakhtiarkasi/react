import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { AppSelect } from "@/components/AppSelect";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getUnit, updateUnit } from "@/services/units";
import {
  UnitOperationalStatus,
  unitOSOptions,
  UnitType,
  unitTypeOptions,
  UpdateUnitInput,
} from "@/types/units";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
} from "react-native";

export default function EditUnitScreen() {
  //theme:
  const theme = useTheme();

  //state:

  //state:
  const [unitCode, setUnitCode] = useState<string>("");
  const [unitType, setUnitType] = useState<UnitType | "">("");
  const [description, setDescription] = useState("");
  const [opStatus, setOpStatus] = useState<UnitOperationalStatus | "">("");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();

  async function loadUnit() {
    try {
      setLoading(true);
      setError(undefined);

      const data = await getUnit(unitId, propertyId);

      setUnitCode(data.unit_code);
      setUnitType(data.unit_type);
      setDescription(data.description ?? "");
      setOpStatus(data.operational_status);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load record.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  //Load the property initially, and if the route's units ID ever changes, load the new unit.
  useEffect(() => {
    loadUnit();
  }, [unitId]);

  const handleSubmit = async () => {
    if (!unitCode.trim()) {
      Alert.alert("Missing information", "Please enter unit code.");
      return;
    }
    if (!unitType) {
      Alert.alert("Missing information", "Please select unit type.");
      return;
    }
    if (!opStatus) {
      Alert.alert("Missing information", "Please select operational status.");
      return;
    }

    try {
      setSaving(true);
      setError(undefined);

      const unit: UpdateUnitInput = {
        unit_code: unitCode.trim(),
        unit_type: unitType as UnitType,
        operational_status: opStatus as UnitOperationalStatus,
        description: description.trim() || null, // Can be a string or null
      };
      //promise should be awaited before going forward
      await updateUnit(unitId, propertyId, unit);
      Alert.alert("Unit Updated", "Record saved successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update record.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <Text style={[styles.title, { color: theme.text }]}>
          Loading unit...
        </Text>
        <ActivityIndicator color={theme.primary} />
      </Screen>
    );
  }

  //checking both error and empty names to ensure that loading property has failed
  if (error && !unitCode) {
    return (
      <Screen>
        <Text style={{ color: theme.danger }}>{error}</Text>
        <AppButton title="Go Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen testID="edit-unit-screen">
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={[styles.title, { color: theme.text }]}>Edit Unit</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Modify details of existing unit
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

        <AppSelect
          label="Operational Status"
          value={opStatus}
          options={unitOSOptions}
          onValueChange={setOpStatus}
        />

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

        <AppButton
          onPress={handleSubmit}
          title="Save Changes"
          loading={saving}
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
