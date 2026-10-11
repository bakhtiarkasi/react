import { AppButton } from "@/components/AppButton";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getTenants } from "@/services/tenants";
import { Tenant } from "@/types/tenant";
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

export default function TenantsScreen() {
  //theme
  const theme = useTheme();

  //state
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  //load properties in past it was: async function loadProperties() {
  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const data = await getTenants();
      setTenants(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load tenants.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTenants();
    }, [loadTenants]),
  );

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
        <AppButton title="Try Again" onPress={loadTenants} />
      </Screen>
    );
  }

  return (
    <Screen testID="tenants-screen">
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>
          Tenants Listing
        </Text>
        <FlatList
          data={tenants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(admin)/tenants/[id]",
                  params: { id: item.id },
                })
              }
            >
              <MenuItem {...item}></MenuItem>
            </Pressable>
          )}
          ListEmptyComponent={
            <View>
              <Text style={[styles.title, { color: theme.warning }]}>
                No tenants have been added yet.
              </Text>
            </View>
          }
        ></FlatList>
        <AppButton
          onPress={() => router.push("/(admin)/tenants/new")}
          title="Add Tenant"
        />
      </View>
    </Screen>
  );
}

function MenuItem({ full_name, phone, cnic }: Tenant) {
  //theme
  const theme = useTheme();
  return (
    <View style={[styles.menuRow, { borderColor: theme.border }]}>
      <Text style={[styles.menuText, { color: theme.text }]}>{full_name}</Text>
      <Text style={[styles.menuText, { color: theme.text }]}>
        {phone ?? "Phone not provided"}
      </Text>
      <Text style={[styles.menuText, { color: theme.text }]}>
        {cnic ?? "CNIC not provided"}
      </Text>
      {/* <Text style={[styles.menuText, { color: theme.text }]}>
        {is_active ? "Active" : "Inactive"}
      </Text> */}
    </View>
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
  menuText: {
    fontSize: FontSize.sm,
  },
});
