import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { colors, spacing } from '../styles/theme';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  restaurantName: string;
  restaurantAddress: string;
  role: 'owner' | 'manager';
  createdAt: string;
}

export default function ProfileScreen() {
  const { userRole, token, userId, restaurantId } = useAuthStore();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [editValues, setEditValues] = React.useState({
    name: '',
    email: '',
    phone: '',
    restaurantName: '',
    restaurantAddress: '',
  });

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const mockProfile = async () => {
        return {
          id: userId || '123',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          restaurantName: 'Ethiopian Delights',
          restaurantAddress: '123 Main St, Addis Ababa',
          role: userRole || 'owner',
          createdAt: '2025-06-24',
        };
      };

      const profileData = await mockProfile();
      setProfile(profileData);
      setEditValues(profileData);
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      // TODO: Replace with actual API call
      const mockUpdate = async () => {
        return { success: true, message: 'Profile updated successfully' };
      };

      await mockUpdate();
      await fetchProfile();
      setEditing(false);
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.role}>{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          {editing ? (
            <TextInput
              value={editValues.name}
              onChangeText={(text) => setEditValues({ ...editValues, name: text })}
              style={styles.input}
            />
          ) : (
            <Text style={styles.value}>{profile.name}</Text>
          )}
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          {editing ? (
            <TextInput
              value={editValues.email}
              onChangeText={(text) => setEditValues({ ...editValues, email: text })}
              style={styles.input}
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.value}>{profile.email}</Text>
          )}
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone</Text>
          {editing ? (
            <TextInput
              value={editValues.phone}
              onChangeText={(text) => setEditValues({ ...editValues, phone: text })}
              style={styles.input}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{profile.phone}</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restaurant Information</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Restaurant Name</Text>
          {editing ? (
            <TextInput
              value={editValues.restaurantName}
              onChangeText={(text) => setEditValues({ ...editValues, restaurantName: text })}
              style={styles.input}
            />
          ) : (
            <Text style={styles.value}>{profile.restaurantName}</Text>
          )}
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Restaurant Address</Text>
          {editing ? (
            <TextInput
              value={editValues.restaurantAddress}
              onChangeText={(text) => setEditValues({ ...editValues, restaurantAddress: text })}
              style={styles.input}
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.value}>{profile.restaurantAddress}</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{profile.role}</Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Joined</Text>
          <Text style={styles.value}>
            {new Date(profile.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {editing ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleUpdate}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    backgroundColor: colors.light,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  role: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  section: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  formGroup: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 4,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  value: {
    fontSize: 16,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  button: {
    padding: spacing.sm,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: spacing.sm,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.light,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
