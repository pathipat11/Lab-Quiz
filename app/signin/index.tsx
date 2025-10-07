import { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import Constants from "expo-constants";
import { useBiometricAuth } from "../../hooks/useBiometricAuth";
import { login as apiLogin, getProfile } from "../../services/authService";
import Feather from "react-native-vector-icons/Feather";

const Signin = () => {
  const { color, isDarkMode } = useTheme();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);

  const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";
  const router = useRouter();
  const { isBiometricSupported, isEnrolled, authenticate } = useBiometricAuth();

  const handleSignin = async () => {
    if (!email || !password) {
      Alert.alert("กรอกไม่ครบ", "โปรดกรอกอีเมลและรหัสผ่าน");
      return;
    }
    setLoading(true);
    try {
      const { token } = await apiLogin(email, password);
      await AsyncStorage.setItem("authToken", token);

      const profile = await getProfile();
      await AsyncStorage.setItem("user", JSON.stringify(profile));

      if (isBiometricSupported && isEnrolled) {
        const ok = await authenticate();
        if (!ok) {
          Alert.alert("ยืนยันตัวตนไม่สำเร็จ", "Biometric ล้มเหลว");
          return;
        }
      }
      router.replace("/main");
    } catch (e: any) {
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", e?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  const canUseBio = isBiometricSupported && isEnrolled;

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: color.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* โลโก้ / แบรนด์ สไตล์ IG */}
      <View style={styles.brandWrap}>
        <Text style={[styles.brand, { color: color.text }]}>Blog CIS</Text>
      </View>

      <View style={[styles.card, { backgroundColor: isDarkMode ? "#0f0f10" : "#ffffff" }]}>
        {/* Email */}
        <View style={[styles.inputWrap, { borderColor: isDarkMode ? "#2b2b2d" : "#e6e6e8", backgroundColor: isDarkMode ? "#121314" : "#fafafa" }]}>
          <Feather name="mail" size={18} color={color.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={color.textSecondary}
            style={[styles.input, { color: color.text }]}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <View style={[styles.inputWrap, { borderColor: isDarkMode ? "#2b2b2d" : "#e6e6e8", backgroundColor: isDarkMode ? "#121314" : "#fafafa" }]}>
          <Feather name="lock" size={18} color={color.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={color.textSecondary}
            style={[styles.input, { color: color.text }]}
            secureTextEntry={secure}
          />
          <TouchableOpacity onPress={() => setSecure(s => !s)}>
            <Feather name={secure ? "eye-off" : "eye"} size={18} color={color.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sign in button */}
        {loading ? (
          <ActivityIndicator size="large" color={color.primary} style={{ marginTop: 8 }} />
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: color.primary }]}
            onPress={handleSignin}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryBtnText}>Sign In</Text>
          </TouchableOpacity>
        )}

        {/* OR divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: isDarkMode ? "#262628" : "#e8e8ea" }]} />
          <Text style={{ color: color.textSecondary, marginHorizontal: 8, fontSize: 12 }}>OR</Text>
          <View style={[styles.divider, { backgroundColor: isDarkMode ? "#262628" : "#e8e8ea" }]} />
        </View>

        {/* Biometric (เฉพาะถ้าตั้งค่าได้) */}
        {canUseBio && !loading && (
          <TouchableOpacity
            onPress={authenticate}
            activeOpacity={0.9}
            style={[styles.ghostBtn, { borderColor: isDarkMode ? "#2b2b2d" : "#e6e6e8", backgroundColor: isDarkMode ? "#141516" : "#fff" }]}
          >
            <Feather name="fingerprint" size={18} color={color.text} style={{ marginRight: 8 }} />
            <Text style={{ color: color.text, fontWeight: "600" }}>Sign in with Biometrics</Text>
          </TouchableOpacity>
        )}

        {/* meta links */}
        <View style={styles.metaRow}>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={{ color: color.textSecondary, fontSize: 12 }}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* signup link */}
      <View style={styles.bottomRow}>
        <Text style={{ color: color.textSecondary, marginRight: 6 }}>Don’t have an account?</Text>
        <Link href="https://cis.kku.ac.th/">
          <Text style={{ color: color.primary, fontWeight: "700" }}>Sign Up</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Signin;

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 22, paddingTop: 50, paddingBottom: 30, justifyContent: "space-between" },
  brandWrap: { alignItems: "center", marginBottom: 22 },
  brand: { fontSize: 36, fontFamily: Platform.select({ ios: "Snell Roundhand", android: "serif" }), fontWeight: "700", letterSpacing: 0.5 },
  card: {
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 14 },
  primaryBtn: { marginTop: 6, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 14 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  ghostBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  metaRow: { marginTop: 12, alignItems: "center" },
  bottomRow: { alignItems: "center", flexDirection: "row", justifyContent: "center" },
});
