import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import {
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  LogOut,
  Moon,
  Shield,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: "English",
    currency: "USD",
  });

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleToggleSetting = (setting: string, value: boolean) => {
    setSettings({
      ...settings,
      [setting]: value,
    });
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/(auth)");
          },
        },
      ]
    );
  };

  const handleLanguageSelect = () => {
    Alert.alert(
      "Select Language",
      "Choose your preferred language",
      [
        { text: "English", onPress: () => setSettings({ ...settings, language: "English" }) },
        { text: "Amharic", onPress: () => setSettings({ ...settings, language: "Amharic" }) },
        { text: "French", onPress: () => setSettings({ ...settings, language: "French" }) },
        { text: "Spanish", onPress: () => setSettings({ ...settings, language: "Spanish" }) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleCurrencySelect = () => {
    Alert.alert(
      "Select Currency",
      "Choose your preferred currency",
      [
        { text: "USD ($)", onPress: () => setSettings({ ...settings, currency: "USD" }) },
        { text: "ETB (Br)", onPress: () => setSettings({ ...settings, currency: "ETB" }) },
        { text: "EUR (€)", onPress: () => setSettings({ ...settings, currency: "EUR" }) },
        { text: "GBP (£)", onPress: () => setSettings({ ...settings, currency: "GBP" }) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    // In a real app, this would navigate to the privacy policy page
    Alert.alert("Privacy Policy", "This would open the privacy policy page.");
  };

  const handleTermsOfService = () => {
    // In a real app, this would navigate to the terms of service page
    Alert.alert("Terms of Service", "This would open the terms of service page.");
  };

  const handleHelpCenter = () => {
    // In a real app, this would navigate to the help center page
    Alert.alert("Help Center", "This would open the help center page.");
  };

  const handleContactSupport = () => {
    // In a real app, this would navigate to the contact support page
    Alert.alert("Contact Support", "This would open the contact support page.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Customize your app preferences
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Bell size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Push Notifications</Text>
                </View>
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => handleToggleSetting("notifications", value)}
                  trackColor={{ false: colors.lightGray, true: colors.primary + "80" }}
                  thumbColor={settings.notifications ? colors.primary : colors.lightText}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Moon size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Dark Mode</Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => handleToggleSetting("darkMode", value)}
                  trackColor={{ false: colors.lightGray, true: colors.primary + "80" }}
                  thumbColor={settings.darkMode ? colors.primary : colors.lightText}
                />
              </View>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleLanguageSelect}
              >
                <View style={styles.settingInfo}>
                  <Globe size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Language</Text>
                </View>
                <View style={styles.settingValue}>
                  <Text style={styles.settingValueText}>{settings.language}</Text>
                  <ChevronRight size={16} color={colors.lightText} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleCurrencySelect}
              >
                <View style={styles.settingInfo}>
                  <Text style={styles.currencyIcon}>$</Text>
                  <Text style={styles.settingText}>Currency</Text>
                </View>
                <View style={styles.settingValue}>
                  <Text style={styles.settingValueText}>{settings.currency}</Text>
                  <ChevronRight size={16} color={colors.lightText} />
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy & Security</Text>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handlePrivacyPolicy}
              >
                <View style={styles.settingInfo}>
                  <Shield size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Privacy Policy</Text>
                </View>
                <ChevronRight size={16} color={colors.lightText} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleTermsOfService}
              >
                <View style={styles.settingInfo}>
                  <Shield size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Terms of Service</Text>
                </View>
                <ChevronRight size={16} color={colors.lightText} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support</Text>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleHelpCenter}
              >
                <View style={styles.settingInfo}>
                  <HelpCircle size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Help Center</Text>
                </View>
                <ChevronRight size={16} color={colors.lightText} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleContactSupport}
              >
                <View style={styles.settingInfo}>
                  <HelpCircle size={20} color={colors.text} style={styles.settingIcon} />
                  <Text style={styles.settingText}>Contact Support</Text>
                </View>
                <ChevronRight size={16} color={colors.lightText} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut size={20} color={colors.error} style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.lightText,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  loadingText: {
    ...typography.body,
    color: colors.lightText,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 16,
  },
  currencyIcon: {
    ...typography.heading3,
    color: colors.text,
    marginRight: 16,
    width: 20,
    textAlign: "center",
  },
  settingText: {
    ...typography.body,
    color: colors.text,
  },
  settingValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValueText: {
    ...typography.body,
    color: colors.lightText,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.error + "10",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: "600",
  },
  versionText: {
    ...typography.caption,
    color: colors.lightText,
    textAlign: "center",
    marginBottom: 24,
  },
});
