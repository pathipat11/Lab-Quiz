import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import Constants from "expo-constants";
import { useTheme } from "../../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");

  const { color } = useTheme();
  const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.warn("No token found");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setUser(data.user);
      setCreatedAt(new Date(data.user.createdAt).toLocaleString());
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openModal = () => {
    if (!user) return;
    setUsername(user.username);
    setEmail(user.email);
    setCreatedAt(new Date(user.createdAt).toLocaleString());
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!username || !email) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

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

      const updated = await res.json();
      setUser(updated.user);
      setModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: color.background }]}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: color.background }]}>
        <Text style={{ color: color.text }}>Unable to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: color.background }}>
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: color.surface }]}>
          <Image
            source={require("../../assets/image/profile.jpg")}
            style={styles.profile}
          />
          <Text style={[styles.name, { color: color.text }]}>{user.username}</Text>
          <Text style={[styles.sub, { color: color.textSecondary }]}>{user.email}</Text>
          <Text style={[styles.sub, { color: color.textSecondary }]}>Role: {user.role}</Text>
          <Text style={[styles.sub, { color: color.textSecondary }]}>Create: {createdAt}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: color.primary }]}
            onPress={openModal}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: color.surface }]}>
              <Text style={[styles.modalTitle, { color: color.text }]}>Edit Profile</Text>

              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={color.textSecondary}
                style={[styles.input, { borderColor: color.textSecondary, color: color.text }]}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={color.textSecondary}
                style={[styles.input, { borderColor: color.textSecondary, color: color.text }]}
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: color.primary }]}
                  onPress={handleUpdate}
                >
                  <Text style={{ color: "#fff" }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#aaa" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: "#fff" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 24,
  },
  profile: { height: 128, width: 128, borderRadius: 64, marginBottom: 12, borderWidth: 3, borderColor: "#4a90e2" },
  name: { fontSize: 24, fontWeight: "700" },
  sub: { fontSize: 14, marginTop: 2, marginBottom: 4 },
  button: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, alignItems: "center" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 14 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", marginHorizontal: 4 },
});
