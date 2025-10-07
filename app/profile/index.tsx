import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { getProfile } from "../../services/authService";
import { useRouter } from "expo-router";

interface User {
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  studentId: string;
  major: string;
  createdAt: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { color } = useTheme();
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      console.log("Profile data:", data);
      setUser({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        role: data.role,
        studentId: data.education?.studentId ?? "",
        major: data.education?.major ?? "",
        createdAt: data.createdAt,
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
          <Text style={[styles.name, { color: color.text }]}>
            {user.firstname} {user.lastname}
          </Text>
          <Text style={[styles.sub, { color: color.textSecondary }]}>
            Email: {user.email}
          </Text>
          <Text style={[styles.sub, { color: color.textSecondary }]}>
            Student ID: {user.studentId}
          </Text>
          <Text style={[styles.sub, { color: color.textSecondary }]}>
            Major: {user.major}
          </Text>
          <Text style={[styles.sub, { color: color.textSecondary }]}>
            Role: {user.role}
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: color.primary }]}
            onPress={() => router.push("/profile/profileEdit")}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
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
    elevation: 4,
    marginBottom: 24,
  },
  profile: {
    height: 128,
    width: 128,
    borderRadius: 64,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#4a90e2",
  },
  name: { fontSize: 24, fontWeight: "700" },
  sub: { fontSize: 14, marginTop: 2, marginBottom: 4 },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
});
