import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { AppSelect } from "@/components/AppSelect";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
    createLeaseWithInitialRent,
    getAvailableUnitsByProperty,
} from "@/services/leases";
import { getActiveProperties } from "@/services/properties";
import { getActiveTenants } from "@/services/tenants";
import { CreateLeaseWithRentInput } from "@/types/lease";
import { Property } from "@/types/property";
import { Tenant } from "@/types/tenant";
import { AvailableUnitType } from "@/types/units";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

//import { Text } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

export default function NewLeaseScreen() {
  //theme:
  const theme = useTheme();

  //state:
  const [startDate, setStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");

  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");

  const [increasePercent, setIncreasePercent] = useState("");
  const [increaseInterval, setIncreaseInterval] = useState("");
  const [nextIncreaseDate, setNextIncreaseDate] = useState("");

  const [notes, setNotes] = useState("");

  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [tenantId, setTenantId] = useState("");

  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setAvailableUnits] = useState<AvailableUnitType[]>([]);

  const [saving, setSaving] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState<boolean>(true);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const router = useRouter();

  async function loadPropertiesAndUnits() {
    try {
      setLoadingForm(true);
      setLoadError(undefined);

      const [propertiesData, tenantsData] = await Promise.all([
        getActiveProperties(),
        getActiveTenants(),
      ]);

      setProperties(propertiesData);
      setTenants(tenantsData);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load properties and tenants";
      setLoadError(message);
    } finally {
      setLoadingForm(false);
    }
  }

  async function loadAvailableUnits() {
    try {
      setLoadingUnits(true);
      setLoadError(undefined);

      const unitsData = await getAvailableUnitsByProperty(propertyId);

      setAvailableUnits(unitsData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load units data";
      setLoadError(message);
    } finally {
      setLoadingUnits(false);
    }
  }

  useEffect(() => {
    loadPropertiesAndUnits();
  }, []);

  useEffect(() => {
    if (!propertyId) {
      return;
    }

    loadAvailableUnits();
  }, [propertyId]);

  if (loadingForm) {
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
  if (loadError) {
    return (
      <Screen>
        <Text style={{ color: theme.danger }}>{loadError}</Text>
        <AppButton title="Go Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  const propertyOptions = properties.map((property) => ({
    label: property.name,
    value: property.id,
  }));

  const tenantOptions = tenants.map((tenant) => ({
    label: tenant.phone
      ? `${tenant.full_name} — ${tenant.phone}`
      : tenant.full_name,

    value: tenant.id,
  }));

  const unitOptions = units.map((unit) => ({
    label: `${unit.unit_code} — ${unit.unit_type}`,
    value: unit.id,
  }));

  const handleSubmit = async () => {
    if (!unitId) {
      Alert.alert("Missing information", "Please select unit");
      return;
    }

    if (!tenantId) {
      Alert.alert("Missing information", "Please select tenant");
      return;
    }

    if (!startDate.trim()) {
      Alert.alert("Missing information", "Please enter start date");
      return;
    }

    if (!securityDeposit.trim()) {
      Alert.alert("Missing information", "Please enter security deposit");
      return;
    }

    if (!monthlyRent.trim()) {
      Alert.alert("Missing information", "Please enter initial monthly rent");
      return;
    }

    const rent = Number(monthlyRent.trim());
    const deposit = Number(securityDeposit.trim());

    if (!Number.isFinite(rent) || rent <= 0) {
      Alert.alert(
        "Invalid information",
        "Monthly rent must be greater than zero.",
      );
      return;
    }

    if (!Number.isFinite(deposit) || deposit < 0) {
      Alert.alert(
        "Invalid information",
        "Security deposit cannot be negative.",
      );
      return;
    }

    const hasIncrease = increasePercent.trim().length > 0;
    const hasInterval = increaseInterval.trim().length > 0;
    const hasNextDate = nextIncreaseDate.trim().length > 0;

    // All true (Option B) OR All false (Option A)
    const isValid =
      (hasIncrease && hasInterval && hasNextDate) ||
      (!hasIncrease && !hasInterval && !hasNextDate);

    if (!isValid) {
      Alert.alert(
        "Invalid information",
        "Schedule increase interval should be wither all blank or all provided, cannot be partial information",
      );
      return;
    }

    const isValidDateFormat = (dateString: string) => {
      // Matches YYYY-MM-DD format strictly
      const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
      return regex.test(dateString);
    };

    if (startDate.trim() && !isValidDateFormat(startDate.trim())) {
      Alert.alert(
        "Invalid date format",
        "Please enter a valid start date in format: YYYY-MM-DD",
      );
      return;
    }

    if (contractEndDate.trim() && !isValidDateFormat(contractEndDate.trim())) {
      Alert.alert(
        "Invalid date format",
        "Please enter a valid end date in format: YYYY-MM-DD",
      );
      return;
    }

    if (
      nextIncreaseDate.trim() &&
      !isValidDateFormat(nextIncreaseDate.trim())
    ) {
      Alert.alert(
        "Invalid date format",
        "Please enter a valid next increase date in format: YYYY-MM-DD",
      );
      return;
    }

    try {
      setSaving(true);
      setSubmitError(undefined);

      const lease: CreateLeaseWithRentInput = {
        unit_id: unitId,
        tenant_id: tenantId,
        start_date: startDate.trim(),
        contract_end_date: contractEndDate.trim() || null,
        agreed_security_deposit: deposit,
        default_increase_percent: increasePercent.trim()
          ? Number(increasePercent)
          : null,
        increase_interval_months: increaseInterval.trim()
          ? Number(increaseInterval)
          : null,
        next_increase_date: nextIncreaseDate.trim() || null,
        initial_monthly_rent: rent,
        notes: notes.trim() || null, // Can be null
      };

      //promise should be awaited before going forward
      await createLeaseWithInitialRent(lease);

      Alert.alert("Lease Saved", "Record saved successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to insert record.";
      setSubmitError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen testID="new-lease-screen" scrollable={true}>
      <View style={styles.keyboardContainer}>
        <Text style={[styles.title, { color: theme.text }]}>Add Lease</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Enter details to create a new lease
        </Text>

        <AppSelect
          label="Property"
          value={propertyId}
          options={propertyOptions}
          onValueChange={(newValue) => {
            setPropertyId(newValue);
            setUnitId("");
          }}
        />

        <AppSelect
          label="Unit"
          value={unitId}
          options={unitOptions}
          onValueChange={setUnitId}
          disabled={!propertyId}
          loading={loadingUnits}
        />

        <AppSelect
          label="Tenant"
          value={tenantId}
          options={tenantOptions}
          onValueChange={setTenantId}
        />

        <AppInput
          label="Start Date"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
        />

        <AppInput
          label="Contract End Date"
          value={contractEndDate}
          onChangeText={setContractEndDate}
          placeholder="YYYY-MM-DD"
        />

        <AppInput
          label="Monthly Rent"
          value={monthlyRent}
          onChangeText={setMonthlyRent}
          placeholder="Enter monthly rent"
          keyboardType="number-pad"
        />

        <AppInput
          label="Security Deposit"
          value={securityDeposit}
          onChangeText={setSecurityDeposit}
          placeholder="Enter security deposit"
          keyboardType="number-pad"
        />

        <AppInput
          label="Rent Increase %"
          value={increasePercent}
          onChangeText={setIncreasePercent}
          placeholder="Enter rent increase percentage"
          keyboardType="number-pad"
        />

        <AppInput
          label="Increase Interval Months"
          value={increaseInterval}
          onChangeText={setIncreaseInterval}
          placeholder="Enter increase interval in months"
          keyboardType="number-pad"
        />

        <AppInput
          label="Next Increase Date"
          value={nextIncreaseDate}
          onChangeText={setNextIncreaseDate}
          placeholder="YYYY-MM-DD"
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
        {submitError && (
          <Text style={{ color: theme.danger }}>{submitError}</Text>
        )}

        <AppButton
          onPress={handleSubmit}
          title="Create Lease"
          loading={saving}
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

  multilineInput: {
    minHeight: 90,
  },
});
