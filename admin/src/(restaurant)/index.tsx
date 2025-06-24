import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, typography } from '../styles/theme';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { login, error, isAuthenticated, loading, clearError } = useAuthStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      clearError();
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      clearError();
    }
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(restaurant)/dashboard');
    }
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>Restaurant Admin</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonLoading]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => {
            // TODO: Navigate to registration
          }}
        >
          <Text style={styles.registerText}>Register Restaurant</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight as 'bold',
    color: colors.text,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.light,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  buttonLoading: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.light,
    ...typography.body,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  registerButton: {
    alignItems: 'center',
  },
  registerText: {
    color: colors.secondary,
    textDecorationLine: 'underline',
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
});
