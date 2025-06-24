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
import { colors, spacing, typography } from '../styles/theme';

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  restaurantName: string;
  restaurantAddress: string;
  phone: string;
}

export default function RegisterScreen() {
  const [formValues, setFormValues] = React.useState<FormValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    restaurantAddress: '',
    phone: '',
  });

  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Basic validation
      if (!formValues.name || !formValues.email || !formValues.password || !formValues.restaurantName) {
        setError('Please fill in all required fields');
        return;
      }

      if (formValues.password !== formValues.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // TODO: Replace with actual API call
      const mockRegister = async () => {
        return {
          success: true,
          message: 'Registration successful',
          token: 'mock-token',
          userId: '123',
          restaurantId: '456',
        };
      };

      const response = await mockRegister();
      // TODO: Handle successful registration
    } catch (err) {
      setError('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>Register Restaurant</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder="Full Name"
          value={formValues.name}
          onChangeText={(value) => handleChange('name', value)}
          style={styles.input}
          autoCapitalize="words"
        />

        <TextInput
          placeholder="Email"
          value={formValues.email}
          onChangeText={(value) => handleChange('email', value)}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Password"
          value={formValues.password}
          onChangeText={(value) => handleChange('password', value)}
          style={styles.input}
          secureTextEntry
        />

        <TextInput
          placeholder="Confirm Password"
          value={formValues.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          style={styles.input}
          secureTextEntry
        />

        <TextInput
          placeholder="Restaurant Name"
          value={formValues.restaurantName}
          onChangeText={(value) => handleChange('restaurantName', value)}
          style={styles.input}
          autoCapitalize="words"
        />

        <TextInput
          placeholder="Restaurant Address"
          value={formValues.restaurantAddress}
          onChangeText={(value) => handleChange('restaurantAddress', value)}
          style={styles.input}
          multiline
          numberOfLines={3}
        />

        <TextInput
          placeholder="Phone Number"
          value={formValues.phone}
          onChangeText={(value) => handleChange('phone', value)}
          style={styles.input}
          keyboardType="phone-pad"
        />

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonLoading]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.light} />
          ) : (
            <Text style={styles.buttonText}>Register Restaurant</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            // TODO: Navigate back to login
          }}
        >
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.light,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  backText: {
    color: colors.text,
    textDecorationLine: 'underline',
  },
});
