import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";

const ProfileEdit = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const { color } = useTheme();
  const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("No token found");

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsername(data.user.username);
      setEmail(data.user.email);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    if (!username || !email) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Update failed");
      }

      Alert.alert("Success", "Profile updated successfully!");
      router.replace("/profile");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
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
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <Text style={[styles.label, { color: color.text }]}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        style={[styles.input, { color: color.text, borderColor: color.textSecondary }]}
      />
      <Text style={[styles.label, { color: color.text }]}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={[styles.input, { color: color.text, borderColor: color.textSecondary }]}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: color.primary }]}
        onPress={handleUpdate}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileEdit;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  label: { fontSize: 14, marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});
