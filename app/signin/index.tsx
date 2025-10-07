import { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import Constants from "expo-constants";
import { useBiometricAuth } from "../../hooks/useBiometricAuth";
import { login as apiLogin, getProfile } from "../../services/authService";

const Signin = () => {
  const { color } = useTheme();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";

  const router = useRouter();
  const { isBiometricSupported, isEnrolled, authenticate } = useBiometricAuth(); // 👈 ใช้งาน hook

  const handleSignin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please fill in both fields.");
      return;
    }
    setLoading(true);
    try {
      // เรียก /signin
      const { token } = await apiLogin(email, password);
      await AsyncStorage.setItem("authToken", token);

      // ดึงโปรไฟล์จาก /profile แล้วเก็บลง storage (ถ้าคุณต้องใช้ต่อ)
      const profile = await getProfile();
      await AsyncStorage.setItem("user", JSON.stringify(profile));

      // biometric เดิม
      if (isBiometricSupported && isEnrolled) {
        const success = await authenticate();
        if (!success) {
          Alert.alert("Authentication Failed", "Biometric authentication failed.");
          return;
        }
      }
      Alert.alert("Success", "Login successful!");
      router.replace("/main");
    } catch (e: any) {
      Alert.alert("Login Error", e?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: color.background }]}>
      <View style={[styles.container, { backgroundColor: color.surface }]}>
        <Text style={[styles.header, { color: color.text }]}>
          Welcome Back 👋
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={color.textSecondary}
          style={[styles.input, { color: color.text, borderColor: color.textSecondary }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={color.textSecondary}
          secureTextEntry
          style={[styles.input, { color: color.text, borderColor: color.textSecondary }]}
        />

        {loading ? (
          <ActivityIndicator size="large" color={color.primary} />
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: color.primary }]}
            onPress={handleSignin}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        )}

        <Link href="/signup" style={styles.link}>
          <Text style={{ color: color.primary }}>
            Don't have an account? Sign Up
          </Text>
        </Link>
      </View>
    </View>
  );
};

export default Signin;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  container: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    alignSelf: "center",
  },
});
