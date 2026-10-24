import { AppButton } from "@/components/AppButton";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getLeases } from "@/services/leases";
import { LeaseWithRent } from "@/types/lease";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function LeasesScreen() {
  //theme
  const theme = useTheme();

  //state
  const [leases, setLeases] = useState<LeaseWithRent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  const loadLeases = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const data = await getLeases();

      setLeases(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load leases.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLeases();
    }, [loadLeases]),
  );

  // Accept an object with a leaseValue property
  function MenuItem({ leaseValue }: { leaseValue: LeaseWithRent }) {
    const theme = useTheme();

    const tenantName = leaseValue.tenants?.full_name ?? "Tenant not available";

    const unitCode = leaseValue.units?.unit_code ?? "Unit not available";

    const unitType = leaseValue.units?.unit_type ?? "";

    const propertyName =
      leaseValue.units?.properties?.name ?? "Property not available";

    const rentAmount = leaseValue.rent_rates?.[0]?.monthly_rent ?? "N/A";

    return (
      <View style={[styles.leaseCard, { borderColor: theme.border }]}>
        <Text style={[styles.tenantName, { color: theme.text }]}>
          {tenantName}
        </Text>

        <Text style={[styles.menuText, { color: theme.textSecondary }]}>
          {propertyName} · {unitCode}
        </Text>

        <Text style={[styles.menuText, { color: theme.textSecondary }]}>
          {unitType}
        </Text>

        <Text style={[styles.menuText, { color: theme.text }]}>
          Rs {rentAmount} / month
        </Text>

        <Text style={[styles.menuText, { color: theme.textSecondary }]}>
          Started {leaseValue.start_date}
        </Text>

        <Text style={[styles.menuText, { color: theme.text }]}>
          {leaseValue.status}
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <Screen>
        <Text style={[styles.title, { color: theme.text }]}>Loading</Text>
        <ActivityIndicator color={theme.primary} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <Text style={[styles.title, { color: theme.warning }]}>{error}</Text>
        <AppButton title="Try Again" onPress={loadLeases} />
      </Screen>
    );
  }

  return (
    <Screen testID="leases-screen">
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>
          Leases Listing
        </Text>
        <FlatList
          data={leases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(admin)/leases/[id]",
                  params: { id: item.id },
                })
              }
            >
              {/* Pass item directly into the leaseValue prop */}
              <MenuItem leaseValue={item} />
            </Pressable>
          )}
          ListEmptyComponent={
            <View>
              <Text style={[styles.title, { color: theme.warning }]}>
                No leases have been added yet.
              </Text>
            </View>
          }
        ></FlatList>
        <AppButton
          onPress={() => router.push("/(admin)/leases/new")}
          title="Add Lease"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  leaseCard: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  tenantName: {
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  menuText: {
    fontSize: FontSize.sm,
  },
});
