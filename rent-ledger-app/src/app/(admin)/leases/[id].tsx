import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { Screen } from "@/components/Screen";
import { FontSize, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  endLease,
  getLease,
  getRentHistory,
  increaseRentRate,
  terminateLease,
} from "@/services/leases";
import { LeaseDetail, RentHistory } from "@/types/lease";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

//import { Text } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function LeaseDetailScreen() {
  //theme:
  const theme = useTheme();

  //state:

  const [lease, setLease] = useState<LeaseDetail | null>(null);
  const [rentHistory, setRentHistory] = useState<RentHistory[]>([]);

  const [loadingForm, setLoadingForm] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | undefined>();

  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitingForm, setSubmittingForm] = useState<boolean>(false);

  const [endLeaseModalVisible, setEndLeaseModalVisible] =
    useState<boolean>(false);

  const [terminateLeaseModalVisible, setTerminateLeaseModalVisible] =
    useState<boolean>(false);

  const [increaseRentModalVisible, setIncreaseRentModalVisible] =
    useState<boolean>(false);

  const [viewRentHistoryModal, setViewRentHistoryModal] =
    useState<boolean>(false);

  const [actualEndDate, setActualEndDate] = useState<string>("");
  const [terminationReason, setTerminationReason] = useState<string>("");

  const [monthlyRentAmount, setMonthlyRentAmount] = useState<string>("");
  const [effectiveFromDate, setEffectiveFromDate] = useState<string>("");

  const [rentIncreaseReason, setRentIncreaseReason] = useState<string>("");

  const [rentHistoryError, setRentHistoryError] = useState<
    string | undefined
  >();
  const [rentHistoryLoading, setRentHistoryLoading] = useState(false);

  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  async function loadLease() {
    try {
      setLoadingForm(true);
      setLoadError(undefined);
      const data = await getLease(id);
      setLease(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load record.";
      setLoadError(message);
    } finally {
      setLoadingForm(false);
    }
  }

  //Load the property initially, and if the route's property ID ever changes, load the new property.
  useEffect(() => {
    loadLease();
  }, [id]);

  useEffect(() => {
    // ONLY fetch data if the state variable is specifically true
    if (viewRentHistoryModal) {
      async function loadRentHistory() {
        try {
          setRentHistoryLoading(true);
          setRentHistoryError(undefined);
          const data = await getRentHistory(id);
          setRentHistory(data);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Unable to load rent history.";
          setRentHistoryError(message);
        } finally {
          setRentHistoryLoading(false);
        }
      }
      loadRentHistory();
    }
  }, [viewRentHistoryModal, id]); // Listens to the state change

  if (loadError) {
    return (
      <Screen>
        <Text style={{ color: theme.danger }}>{loadError}</Text>
        <AppButton title="Go Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (loadingForm) {
    return (
      <Screen>
        <Text style={[styles.title, { color: theme.text }]}>
          Loading lease...
        </Text>
        <ActivityIndicator color={theme.primary} />
      </Screen>
    );
  }

  const isValidDateFormat = (dateString: string) => {
    // Matches YYYY-MM-DD format strictly
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    return regex.test(dateString);
  };

  const validateLeaseDate = (
    actualEndDate: string,
    startDate: string,
    type: string,
  ) => {
    const trimmedDate = actualEndDate?.trim() || "";
    const displayType = type === "end" ? "end" : "termination";
    const capitalDisplayType = type === "end" ? "End" : "Termination";
    const now = new Date();
    const today =
      `${now.getFullYear()}-` +
      `${String(now.getMonth() + 1).padStart(2, "0")}-` +
      `${String(now.getDate()).padStart(2, "0")}`;

    if (!trimmedDate) {
      return {
        title: "Missing information",
        message: `Please enter the actual ${displayType} date.`,
      };
    }

    if (!isValidDateFormat(trimmedDate)) {
      return {
        title: "Invalid date format",
        message: `Please enter a valid ${displayType} date in format: YYYY-MM-DD.`,
      };
    }

    if (trimmedDate < (startDate ?? "")) {
      return {
        title: "Invalid date value",
        message: `Actual ${capitalDisplayType} date cannot happen before contract start date`,
      };
    }

    if (actualEndDate.trim() > today) {
      return {
        title: "Invalid date value",
        message: `Actual ${displayType} date cannot be a future date.`,
      };
    }

    return null; // Valid
  };

  async function handleEndDateConfirmed() {
    try {
      setSubmittingForm(true);
      setSubmitError(undefined);
      const data = await endLease(id, actualEndDate);
      await loadLease();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save record.";
      setSubmitError(message);
    } finally {
      setSubmittingForm(false);
    }
  }

  async function handleTerminateContract() {
    try {
      setSubmittingForm(true);
      setSubmitError(undefined);
      const data = await terminateLease(
        id,
        actualEndDate.trim(),
        terminationReason.trim(),
      );
      await loadLease();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save record.";
      setSubmitError(message);
    } finally {
      setSubmittingForm(false);
    }
  }

  async function handleIncreaseRentRate() {
    try {
      setSubmittingForm(true);
      setSubmitError(undefined);
      const data = await increaseRentRate(
        id,
        effectiveFromDate.trim(),
        Number(monthlyRentAmount.trim()),
        rentIncreaseReason.trim(),
      );
      resetRentModalForm();
      await loadLease();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save record.";
      setSubmitError(message);
    } finally {
      setSubmittingForm(false);
    }
  }

  function handleEndLeaseContinue() {
    const dateError = validateLeaseDate(
      actualEndDate,
      lease?.start_date ?? "",
      "end",
    );

    if (dateError) {
      Alert.alert(dateError.title, dateError.message);
      return;
    }

    setEndLeaseModalVisible(false);

    Alert.alert(
      `End Lease?`,
      `This lease will be ended effective ${actualEndDate}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "End Lease",
          style: "default",
          onPress: () => {
            handleEndDateConfirmed();
          },
        },
      ],
    );
  }

  function handleIncreaseRentContinue() {
    if (!effectiveFromDate.trim()) {
      Alert.alert("Missing information", "Please enter effective from date");
      return;
    }

    if (!isValidDateFormat(effectiveFromDate.trim())) {
      Alert.alert(
        "Invalid date format",
        `Please enter a valid effective from date in format: YYYY-MM-DD.`,
      );
      return;
    }

    // 1. Pass the raw YYYY-MM-DD string (JavaScript automatically parses this as UTC)
    const date = new Date(effectiveFromDate.trim());
    // 2. Subtract one day using UTC methods
    date.setUTCDate(date.getUTCDate() - 1);
    // 3. Convert back to string (safe because it's already locked to UTC)
    const prevRentEffectiveTo = date.toISOString().split("T")[0];

    if (prevRentEffectiveTo < (lease?.rent_rates[0]?.effective_from ?? "")) {
      Alert.alert(
        "Invalid effective from date",
        `Effective from date must be after the current effective from date by at least 1 day`,
      );
      return;
    }

    const now = new Date();
    const today =
      `${now.getFullYear()}-` +
      `${String(now.getMonth() + 1).padStart(2, "0")}-` +
      `${String(now.getDate()).padStart(2, "0")}`;

    if (effectiveFromDate.trim() > today) {
      Alert.alert(
        "Invalid date value",
        `Effective from date cannot be a future date.`,
      );
      return;
    }

    if (!monthlyRentAmount.trim()) {
      Alert.alert("Missing information", "Please enter monthly rent amount");
      return;
    }

    const rent = Number(monthlyRentAmount.trim()); //Number("") return 0, empty return zero

    if (!Number.isFinite(rent) || rent <= 0) {
      Alert.alert(
        "Invalid information",
        "Monthly rent must be greater than zero and should in valid range.",
      );
      return;
    }

    if (rent <= Number(lease?.rent_rates[0]?.monthly_rent)) {
      Alert.alert(
        "Invalid information",
        "Monthly rent must be greater than the previous rent.",
      );
      return;
    }

    if (!rentIncreaseReason.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the reason for rent increase.",
      );
      return;
    }

    setIncreaseRentModalVisible(false);

    Alert.alert(
      `Increase rent rate?`,
      `This rent rate of this lease will change from ${lease?.rent_rates[0]?.monthly_rent} to ${monthlyRentAmount} effective ${effectiveFromDate}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Increase Rent Rate",
          style: "default",
          onPress: () => {
            handleIncreaseRentRate();
          },
        },
      ],
    );
  }

  function handleTerminateLeaseContinue() {
    const dateError = validateLeaseDate(
      actualEndDate,
      lease?.start_date ?? "",
      "termination",
    );

    if (dateError) {
      Alert.alert(dateError.title, dateError.message);
      return;
    }

    if (!terminationReason.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the reason for termination.",
      );
      return;
    }

    setTerminateLeaseModalVisible(false);

    Alert.alert(
      `Terminate Lease?`,
      `This lease will be terminated effective ${actualEndDate}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Terminate Lease",
          style: "destructive",
          onPress: () => {
            handleTerminateContract();
          },
        },
      ],
    );
  }

  function resetRentModalForm() {
    setMonthlyRentAmount("");
    setEffectiveFromDate("");
    setRentIncreaseReason("");
  }

  return (
    <Screen testID="lease-details-screen" scrollable={true}>
      <View style={styles.keyboardContainer}>
        <Text style={[styles.title, { color: theme.text }]}>Lease Details</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          View lease details and manage lease actions.
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Property</Text>
        <Text
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {lease?.units?.properties?.name}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Unit</Text>
        <Text
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {lease?.units?.unit_code} — {lease?.units?.unit_type}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Tenant</Text>
        <Text
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {lease?.tenants?.full_name} — {lease?.tenants?.phone}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Start Date</Text>
        <Text
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {lease?.start_date}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>
          Contract End Date
        </Text>
        <Text
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {lease?.contract_end_date}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Monthly Rent</Text>
        <Text
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {lease?.rent_rates[0]?.monthly_rent}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>
          Security Deposit
        </Text>
        <Text
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {lease?.agreed_security_deposit}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>
          Rent Increase %
        </Text>
        <Text
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {lease?.default_increase_percent}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>
          Increase Interval Months
        </Text>
        <Text
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {lease?.increase_interval_months}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>
          Next Increase Date
        </Text>
        <Text
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {lease?.next_increase_date}
        </Text>

        <Text style={[styles.label, { color: theme.text }]}>Status</Text>
        <Text
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {lease?.status}
        </Text>
        {lease?.status !== "active" && (
          <>
            <Text style={[styles.label, { color: theme.text }]}>
              {lease?.status === "ended"
                ? "Actual End Date"
                : "Termination Date"}
            </Text>
            <Text
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              {lease?.actual_end_date}
            </Text>
            {lease?.status === "terminated" && (
              <>
                <Text style={[styles.label, { color: theme.text }]}>
                  Termination Reason
                </Text>
                <Text
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  {lease?.termination_reason}
                </Text>
              </>
            )}
          </>
        )}
        <AppButton
          title="View Rent History"
          disabled={submitingForm}
          variant="secondary"
          onPress={() => {
            setViewRentHistoryModal(true);
          }}
          style={{ marginBottom: Spacing.sm }}
        />

        {submitError && (
          <Text style={{ color: theme.danger }}>{submitError}</Text>
        )}

        {lease?.status === "active" && (
          <>
            <AppButton
              title="Increase Rent"
              disabled={submitingForm}
              onPress={() => setIncreaseRentModalVisible(true)}
            />
            <AppButton
              title="End Lease"
              onPress={() => setEndLeaseModalVisible(true)}
              disabled={submitingForm}
            />
            <AppButton
              title="Terminate Lease"
              disabled={submitingForm}
              onPress={() => setTerminateLeaseModalVisible(true)}
            />
          </>
        )}

        <Modal
          visible={endLeaseModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setEndLeaseModalVisible(false)} // Android hardware back button support
        >
          <View
            style={[
              styles.modalOverlay,
              {
                backgroundColor: `${theme.surface}80`,
              },
            ]}
          >
            <View
              style={[styles.modalContent, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.title, { color: theme.text }]}>
                End Lease
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                To end lease, enter the actual end date.
              </Text>
              <AppInput
                label="Actual End Date"
                value={actualEndDate}
                onChangeText={setActualEndDate}
                placeholder="YYYY-MM-DD"
              />

              <AppButton title="Continue" onPress={handleEndLeaseContinue} />

              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => setEndLeaseModalVisible(false)}
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={terminateLeaseModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setTerminateLeaseModalVisible(false)} // Android hardware back button support
        >
          <View
            style={[
              styles.modalOverlay,
              {
                backgroundColor: `${theme.surface}80`,
              },
            ]}
          >
            <View
              style={[styles.modalContent, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.title, { color: theme.text }]}>
                Terminate Lease
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                To terminate lease, enter the actual termination date and
                reason.
              </Text>
              <AppInput
                label="Actual Termination Date"
                value={actualEndDate}
                onChangeText={setActualEndDate}
                placeholder="YYYY-MM-DD"
              />
              <AppInput
                label="Reason for termination"
                value={terminationReason}
                onChangeText={setTerminationReason}
                placeholder="Enter termination reason"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={styles.multilineInput}
              />

              <AppButton
                title="Continue"
                onPress={handleTerminateLeaseContinue}
              />

              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => setTerminateLeaseModalVisible(false)}
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={increaseRentModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIncreaseRentModalVisible(false)} // Android hardware back button support
        >
          <View
            style={[
              styles.modalOverlay,
              {
                backgroundColor: `${theme.surface}80`,
              },
            ]}
          >
            <View
              style={[styles.modalContent, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.title, { color: theme.text }]}>
                Increase Rent Rate
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                To increase rent rate, enter the effective from and new amount
                below.
              </Text>
              <Text style={[styles.label, { color: theme.text }]}>
                Current Monthly Rent
              </Text>
              <Text
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                {lease?.rent_rates[0]?.monthly_rent}
              </Text>
              <AppInput
                label="Monthly Rent"
                value={monthlyRentAmount}
                onChangeText={setMonthlyRentAmount}
                placeholder="Enter Amount"
                keyboardType="number-pad"
              />
              <AppInput
                label="Effective From Date"
                value={effectiveFromDate}
                onChangeText={setEffectiveFromDate}
                placeholder="YYYY-MM-DD"
              />
              <AppInput
                label="Reason"
                value={rentIncreaseReason}
                onChangeText={setRentIncreaseReason}
                placeholder="Enter reason for rent increase"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={styles.multilineInput}
              />

              <AppButton
                title="Continue"
                onPress={handleIncreaseRentContinue}
              />

              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setIncreaseRentModalVisible(false);
                  resetRentModalForm();
                }}
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={viewRentHistoryModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setViewRentHistoryModal(false)} // Android hardware back button support
        >
          <View
            style={[
              styles.modalOverlay,
              {
                backgroundColor: `${theme.surface}80`,
              },
            ]}
          >
            <View
              style={[styles.modalContent, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.title, { color: theme.text }]}>
                Rent History
              </Text>
              {rentHistoryLoading ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <FlatList
                  data={rentHistory}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View
                      style={[styles.menuRow, { borderColor: theme.border }]}
                    >
                      <Text style={[styles.menuText, { color: theme.text }]}>
                        {item.effective_from} → {item.effective_to ?? "Current"}
                      </Text>
                      <Text style={[styles.menuText, { color: theme.text }]}>
                        Rs {Number(item.monthly_rent).toLocaleString()}
                      </Text>

                      <Text style={[styles.menuText, { color: theme.text }]}>
                        {item.increase_percent !== null
                          ? `+${item.increase_percent}%`
                          : "Initial rent"}
                      </Text>

                      <Text style={[styles.menuText, { color: theme.text }]}>
                        {item.reason ?? "No reason recorded"}
                      </Text>
                    </View>
                  )}
                  ListEmptyComponent={
                    <View>
                      <Text style={[styles.title, { color: theme.warning }]}>
                        {rentHistoryError ??
                          "No rent rate exists for this lease."}
                      </Text>
                    </View>
                  }
                ></FlatList>
              )}

              <AppButton
                title="close"
                variant="primary"
                onPress={() => setViewRentHistoryModal(false)}
                style={{ marginTop: Spacing.sm }}
              />
            </View>
          </View>
        </Modal>
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
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },

  modalOverlay: {
    flex: 1,
    // opacity: 0.3, // Dimmed background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: Radius.md,
    padding: Spacing.md,
    maxHeight: "85%", // Prevents list from overflowing screen limits
    elevation: 5,
  },
  menuRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  menuText: {
    fontSize: FontSize.sm,
  },
});
