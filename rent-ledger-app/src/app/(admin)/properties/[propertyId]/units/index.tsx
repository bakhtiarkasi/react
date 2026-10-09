import { AppButton } from "@/components/AppButton";
import { Screen } from "@/components/Screen";
import { FontSize, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getProperty } from "@/services/properties";
import { getUnitsByProperty } from "@/services/units";
import { Unit } from "@/types/units";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function UnitsScreen() {
  const theme = useTheme();

  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [units, setUnits] = useState<Unit[]>([]);
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const [propertyName, setPropertyName] = useState<string>("");

  //async function loadUnits() {
  const loadUnits = useCallback(async () => {
    try {
      setError(undefined);
      setLoading(true);

      const [unitsData, property] = await Promise.all([
        getUnitsByProperty(propertyId),
        getProperty(propertyId),
      ]);

      setUnits(unitsData);
      setPropertyName(property.name);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load units.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  /*  loadUnits uses propertyId
  → loadUnits depends on propertyId

 focus effect uses loadUnits
 → focus effect depends on loadUnits*/
  useFocusEffect(
    useCallback(() => {
      loadUnits();
    }, [loadUnits]),
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
        <AppButton title="Try Again" onPress={loadUnits} />
      </Screen>
    );
  }

  return (
    <Screen testID="units-screen">
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>
          {propertyName}
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>Units</Text>
        <FlatList
          data={units}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(admin)/properties/[propertyId]/units/[unitId]",
                  params: { propertyId: propertyId, unitId: item.id },
                })
              }
            >
              <MenuItem {...item}></MenuItem>
            </Pressable>
          )}
          ListEmptyComponent={
            <View>
              <Text style={[styles.title, { color: theme.warning }]}>
                No units have been added yet.
              </Text>
            </View>
          }
        ></FlatList>
        <AppButton
          onPress={() => {
            router.push({
              pathname: "/(admin)/properties/[propertyId]/units/new",
              params: {
                propertyId: propertyId,
              },
            });
          }}
          title="Add Unit"
        />
      </View>
    </Screen>
  );
}

function MenuItem({ unit_code, unit_type, operational_status }: Unit) {
  //theme
  const theme = useTheme();
  return (
    <View style={[styles.menuRow, { borderColor: theme.border }]}>
      <Text style={[styles.menuText, { color: theme.text }]}>{unit_code}</Text>
      <Text style={[styles.menuText, { color: theme.text }]}>{unit_type}</Text>
      <Text style={[styles.menuText, { color: theme.text }]}>
        {operational_status}
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
