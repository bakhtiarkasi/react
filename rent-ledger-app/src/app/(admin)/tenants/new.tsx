import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { createTenant } from "@/services/tenants";
import { CreateTenantInput } from "@/types/tenant";
import { useRouter } from "expo-router";
import { useState } from "react";

//import { Text } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function NewTenantScreen() {
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

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!full_name.trim()) {
      Alert.alert("Missing information", "Please enter full name.");
      return;
    }

    try {
      setSaving(true);
      setError(undefined);

      const tenant: CreateTenantInput = {
        full_name: full_name.trim(),
        father_name: father_name.trim() || null,
        cnic: cnic.trim() || null,
        permanent_address: address.trim() || null, // Can be a string or null
        phone: phone.trim() || null,
        alternate_phone: alternate_phone.trim() || null,
        notes: notes.trim() || null, // Can be null
      };
      //promise should be awaited before going forward
      await createTenant(tenant);

      Alert.alert("Tenant Saved", "Record saved successfully", [
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
    <Screen testID="new-tenant-screen" scrollable={true}>
      <View style={styles.keyboardContainer}>
        <Text style={[styles.title, { color: theme.text }]}>Add Tenant</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Enter details to add a new tenant
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
        {error && <Text style={{ color: theme.danger }}>{error}</Text>}

        <AppButton onPress={handleSubmit} title="Submit" loading={saving} />
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

  multilineInput: {
    minHeight: 90,
  },
});
