import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function IndexScreen() {
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace('/login');
      return;
    }

    if (!profile) {
      return;
    }

    if (!profile.is_active) {
      router.replace('/login');
      return;
    }

    if (profile.role === 'admin') {
      router.replace('/(admin)/dashboard');
      return;
    }

    if (profile.role === 'collector') {
      router.replace('/(collector)/dashboard');
      return;
    }

    if (profile.role === 'support') {
      router.replace('/(support)/dashboard');
      return;
    }

    if (profile.role === 'tenant') {
      router.replace('/(tenant)/dashboard');
      return;
    }
  }, [session, profile, loading]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 12 }}>Loading rent ledger...</Text>
    </View>
  );
}