import { useEffect, useState } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBiometricAuth } from "../hooks/useBiometricAuth";

export default function IndexPage() {
  const router = useRouter();
  const { isBiometricSupported, isEnrolled, authenticate } = useBiometricAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log("Token:", token);
      console.log("isBiometricSupported:", isBiometricSupported);
      console.log("isEnrolled:", isEnrolled);

      if (!token) {
        router.replace("/signin");
        return;
      }

      if (isBiometricSupported && isEnrolled) {
        const success = await authenticate();
        console.log("Biometric auth success:", success);
        if (!success) {
          Alert.alert("Authentication Failed", "Biometric authentication failed.");
          router.replace("/signin");
          return;
        }
      }

      router.replace("/main");
    } catch (error) {
      console.error("Error reading token:", error);
      router.replace("/signin");
    } finally {
      setLoading(false);
    }
  };

  checkLogin();
  }, [isBiometricSupported, isEnrolled]);


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  return null;
}
