import { AppButton } from "@/components/AppButton";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getProperties } from "@/services/properties";
import { Property } from "@/types/property";
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

export default function PropertiesScreen() {
  //theme
  const theme = useTheme();

  //state
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  //load properties
  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const data = await getProperties();

      setProperties(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load properties.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [loadProperties]),
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
        <AppButton title="Try Again" onPress={loadProperties} />
      </Screen>
    );
  }

  return (
    <Screen testID="properties-screen">
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>
          Properties Listing
        </Text>
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(admin)/properties/[id]",
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
                No properties have been added yet.
              </Text>
            </View>
          }
        ></FlatList>
        <AppButton
          onPress={() => {
            router.push("/(admin)/properties/new");
          }}
          title="Add Property"
        />
      </View>
    </Screen>
  );
}

function MenuItem({ name, is_active, address }: Property) {
  //theme
  const theme = useTheme();
  return (
    <View style={[styles.menuRow, { borderColor: theme.border }]}>
      <Text style={[styles.menuText, { color: theme.text }]}>{name}</Text>
      <Text style={[styles.menuText, { color: theme.text }]}>
        {address ?? "No address provided"}
      </Text>
      {/* <Text style={[styles.menuText, { color: theme.text }]}>
        {notes ?? "-"}
      </Text> */}
      <Text style={[styles.menuText, { color: theme.text }]}>
        {is_active ? "Active" : "Inactive"}
      </Text>
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
