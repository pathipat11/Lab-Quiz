import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";

const ProfileEdit = () => {
  const { color, isDarkMode } = useTheme();
  const router = useRouter();

  const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";
  const API_KEY: string = Constants.expoConfig?.extra?.apiKey || "";

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // สำหรับเช็คว่ามีการเปลี่ยนแปลงไหม -> ใช้ disable ปุ่ม Save
  const [orig, setOrig] = useState<{ username: string; email: string }>({
    username: "",
    email: "",
  });

  const isDirty = useMemo(
    () => username.trim() !== orig.username || email.trim() !== orig.email,
    [username, email, orig]
  );

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No token found");

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const raw = await res.text();
        throw new Error(raw || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const u = data?.user ?? data?.data ?? data;

      setUsername(u?.username ?? "");
      setEmail(u?.email ?? "");
      setOrig({ username: u?.username ?? "", email: u?.email ?? "" });

      // เก็บลง storage เพื่อให้ Header/Avatar อัปเดตได้
      await AsyncStorage.setItem("user", JSON.stringify(u));
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async () => {
    if (!username.trim() || !email.trim()) {
      Alert.alert("Validation Error", "กรอก Username และ Email ให้ครบ");
      return;
    }
    // เช็ก email แบบง่ายๆ
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert("Validation Error", "รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No token");

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-api-key": API_KEY,
          Accept: "application/json",
        },
        body: JSON.stringify({ username: username.trim(), email: email.trim() }),
      });

      if (!res.ok) {
        const raw = await res.text();
        let msg = "Update failed";
        try {
          const j = raw ? JSON.parse(raw) : null;
          msg = j?.message || j?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const updated = await res.json();
      const u = updated?.user ?? updated?.data ?? updated;

      // sync state + storage
      setOrig({ username: u?.username ?? username, email: u?.email ?? email });
      await AsyncStorage.setItem("user", JSON.stringify(u));

      Alert.alert("สำเร็จ", "บันทึกโปรไฟล์เรียบร้อย");
      router.replace("/profile");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message || "ไม่สามารถอัปเดตโปรไฟล์");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: color.background }]}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: color.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        style={{ flex: 1 }}
      >
        {/* Header card */}
        <View style={[styles.header, { backgroundColor: color.surface }]}>
          <Text style={[styles.title, { color: color.text }]}>แก้ไขโปรไฟล์</Text>
          <Text style={{ color: color.textSecondary, marginTop: 2 }}>
            อัปเดตชื่อผู้ใช้และอีเมลของคุณ
          </Text>
        </View>

        {/* Form card */}
        <View style={[styles.card, { backgroundColor: color.surface }]}>
          <View style={styles.inputWrap}>
            <Feather
              name="user"
              size={18}
              color={isDarkMode ? "#bbb" : "#666"}
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor={color.textSecondary}
              style={[styles.input, { color: color.text }]}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Feather
              name="mail"
              size={18}
              color={isDarkMode ? "#bbb" : "#666"}
              style={{ marginRight: 8 }}
            />
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

          <TouchableOpacity
            disabled={saving || !isDirty}
            onPress={handleUpdate}
            style={[
              styles.button,
              {
                backgroundColor: isDirty ? color.primary : "#9aa0a6",
                opacity: saving ? 0.7 : 1,
              },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>บันทึกการเปลี่ยนแปลง</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfileEdit;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    // เงาแบบเดียวกับที่ใช้ทั้งแอป
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: "800" },

  card: {
    marginTop: 14,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 2,
  },

  button: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", letterSpacing: 0.2 },
});
