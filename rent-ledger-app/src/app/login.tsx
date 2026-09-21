import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function LoginScreen() {
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing information', 'Please enter email and password.');
      return;
    }

    try {
      await signIn(email, password);
      router.replace('/');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login failed. Please try again.';
      Alert.alert('Login failed', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: 8,
          }}
        >
          Rent Ledger
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: '#475569',
            marginBottom: 32,
          }}
        >
          Sign in to manage rent collection and approvals.
        </Text>

        <Text style={{ marginBottom: 6, color: '#334155', fontWeight: '600' }}>
          Email
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            borderWidth: 1,
            borderColor: '#cbd5e1',
            backgroundColor: '#ffffff',
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 16,
          }}
        />

        <Text style={{ marginBottom: 6, color: '#334155', fontWeight: '600' }}>
          Password
        </Text>

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
          style={{
            borderWidth: 1,
            borderColor: '#cbd5e1',
            backgroundColor: '#ffffff',
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 24,
          }}
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#94a3b8' : '#0f172a',
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ color: '#ffffff', fontWeight: '700' }}>Login</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}