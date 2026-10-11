import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getTenant, setTenantActive, updateTenant } from "@/services/tenants";
import { UpdateTenantInput } from "@/types/tenant";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

//import { Text } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

export default function EditTenantScreen() {
  //theme:
  const theme = useTheme();

  //state:
  const [full_name, setFullName] = useState("");
  const [father_name, setFatherName] = useState("");
  const [cnic, setCNIC] = useState("");
  const [phone, setPhone] = useState("");
  const [alternate_phone, setAlternatePhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setActive] = useState(true);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  async function loadTenant() {
    try {
      setLoading(true);
      setError(undefined);
      const data = await getTenant(id);
      setFullName(data.full_name);
      setFatherName(data.father_name ?? "");
      setCNIC(data.cnic ?? "");
      setPhone(data.phone ?? "");
      setAlternatePhone(data.alternate_phone ?? "");
      setAddress(data.permanent_address ?? "");
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

  //Load the tenant initially, and if the route's tenant ID ever changes, load the new tenant.
  useEffect(() => {
    loadTenant();
  }, [id]);

  const handleSubmit = async () => {
    if (!full_name.trim()) {
      Alert.alert("Missing information", "Please enter full name.");
      return;
    }

    try {
      setSaving(true);
      setError(undefined);

      const tenant: UpdateTenantInput = {
        full_name: full_name.trim(),
        father_name: father_name.trim() || null,
        cnic: cnic.trim() || null,
        permanent_address: address.trim() || null, // Can be a string or null
        phone: phone.trim() || null,
        alternate_phone: alternate_phone.trim() || null,
        notes: notes.trim() || null, // Can be null
      };
      //promise should be awaited before going forward
      await updateTenant(id, tenant);

      Alert.alert("Tenant Saved", "Record updated successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update tenant.";
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
      await setTenantActive(id, nextActiveStatus);
      setActive(nextActiveStatus); // 2. Update screen layout state
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update tenant status.";
      setError(message);
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <Text style={[styles.title, { color: theme.text }]}>
          Loading tenant...
        </Text>
        <ActivityIndicator color={theme.primary} />
      </Screen>
    );
  }

  //checking both error and empty names to ensure that loading tenant has failed
  if (error && !full_name) {
    return (
      <Screen>
        <Text style={{ color: theme.danger }}>{error}</Text>
        <AppButton title="Go Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen testID="edit-tenant-screen" scrollable={true}>
      <View style={styles.keyboardContainer}>
        <Text style={[styles.title, { color: theme.text }]}>Edit Tenant</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Modify details of the existing tenant
        </Text>

        <AppInput
          label="Full Name"
          value={full_name}
          onChangeText={setFullName}
          placeholder="Enter full name"
        />

        <AppInput
          label="Father Name"
          value={father_name}
          onChangeText={setFatherName}
          placeholder="Enter father name"
        />

        <AppInput
          label="CNIC"
          value={cnic}
          onChangeText={setCNIC}
          placeholder="Enter CNIC"
        />

        <AppInput
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <AppInput
          label="Alternate Phone"
          value={alternate_phone}
          onChangeText={setAlternatePhone}
          placeholder="Enter alternate phone number"
          keyboardType="phone-pad"
        />

        <AppInput
          label="Permanent Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Enter permanent address"
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
              nextStatus ? "Activate this tenant?" : "Deactivate this tenant?",
              "The tenant will remain in the system and its historical records will be preserved.",
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
      </View>
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
