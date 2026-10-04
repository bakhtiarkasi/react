import { useAuth } from "@/context/AuthContext";
import { Pressable, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { useRouter } from "expo-router";

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();

  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      <Text style={{ fontSize: 26, fontWeight: "700", marginBottom: 8 }}>
        Admin Dashboard
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 24 }}>
        Welcome, {profile?.full_name}
      </Text>

      <Text style={{ fontSize: 15, color: "#475569", marginBottom: 24 }}>
        This role will approve collector entries, manage properties, tenants,
        leases, rent rates, and reports.
      </Text>

      <AppButton
        title="Go to Properties"
        variant="primary"
        loading={false}
        onPress={() => {
          router.push("/(admin)/properties");
        }}
      ></AppButton>

      <Pressable
        onPress={signOut}
        style={{
          backgroundColor: "#0f172a",
          padding: 14,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#ffffff", fontWeight: "700" }}>Logout</Text>
      </Pressable>
    </View>
  );
}
