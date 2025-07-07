import Button from "@/components/Button";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";


export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const isTablet = width > 768;

  const handleGetStarted = () => {
    router.push("/register");
  };

  const handleRestaurantOwner = () => {
    router.push("/restaurant-owner-signup");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/background.jpg")}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.6)']}
        style={styles.gradientOverlay}
      />
      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>ገበታ</Text>
          <Text style={styles.subtitle}>
            Discover authentic Ethiopian flavors
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Button
            title="Get Started as Customer"
            onPress={handleGetStarted}
            variant="primary"
            size="large"
            fullWidth
            style={styles.button}
          />
          
          <Button
            title="Join as Restaurant Owner"
            onPress={handleRestaurantOwner}
            variant="outline"
            size="large"
            fullWidth 
            style={styles.buttonSecondary}
            textStyle={styles.buttonSecondaryText}
            />
          
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    zIndex: -1,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: "center",
    marginTop: 60,
  },
  title: {
    ...typography.heading1,
    color: colors.white,
    fontSize:126,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "bold",
    textShadowColor: colors.black,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.white,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: colors.black,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 4,
  },
  footer: {
    marginBottom: 24,
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  secondaryButton: {
    marginTop: 16,
    borderColor: colors.white,
    color: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  secondaryButtonText: {
    color: colors.white,
  },
  termsText: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 24,
    fontWeight: "bold",
    textShadowColor: colors.black,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 4,
  },
  button: {
    width: "100%",
    alignSelf: "center",
    borderColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
  },
  buttonSecondary: {
    borderColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
  },
  buttonSecondaryText: {
    color: colors.white,
  },
});
