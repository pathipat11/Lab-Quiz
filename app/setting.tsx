import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from "react-native";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const SettingPage: React.FC = () => {
  const { color, toggleTheme } = useTheme();
  const router = useRouter();
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // โหลดค่า biometric จาก storage
  useEffect(() => {
    const loadSetting = async () => {
      const value = await AsyncStorage.getItem("biometricEnabled");
      setBiometricEnabled(value === "true");
    };
    loadSetting();
  }, []);

  // toggle biometric
  const toggleBiometric = async () => {
    const newValue = !biometricEnabled;
    setBiometricEnabled(newValue);
    await AsyncStorage.setItem("biometricEnabled", String(newValue));
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("authToken");
          router.replace("/signin");
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <Text style={[styles.heading, { color: color.primary }]}>Settings</Text>

      {/* Toggle theme */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: color.surface }]}
        onPress={toggleTheme}
      >
        <Text style={[styles.buttonText, { color: color.text }]}>Toggle Theme</Text>
      </TouchableOpacity>

      {/* Toggle biometric */}
      <View style={[styles.switchContainer, { backgroundColor: color.surface }]}>
        <Text style={[styles.switchLabel, { color: color.text }]}>
          Enable Biometric Login
        </Text>
        <Switch
          value={biometricEnabled}
          onValueChange={toggleBiometric}
          thumbColor={biometricEnabled ? color.primary : "#ccc"}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#dc3545" }]}
        onPress={handleLogout}
      >
        <Text style={[styles.buttonText, { color: "#fff" }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
});
