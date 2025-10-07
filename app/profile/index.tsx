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
import { useTheme } from "../../context/ThemeContext";
import { getProfile, updateProfile } from "../../services/authService";

export default function Profile() {
  const { color } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // ฟิลด์ที่จะแก้ไข
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [studentId, setStudentId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [advisorId, setAdvisorId] = useState("");

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      const profile = res?.data ?? res;
      setData(profile);
    } catch (err) {
      console.error("Fetch profile error:", err);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const openModal = () => {
    if (!data) return;
    setFirstname(data.firstname ?? "");
    setLastname(data.lastname ?? "");
    setStudentId(data.education?.studentId ?? "");
    setSchoolId(data.education?.schoolId ?? "");
    setAdvisorId(data.education?.advisorId ?? "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!firstname || !lastname || !studentId) {
      Alert.alert("Validation Error", "กรอกชื่อ นามสกุล และรหัสนักศึกษาให้ครบ");
      return;
    }
    try {
      const updated = await updateProfile({
        firstname,
        lastname,
        studentId,
        schoolId: schoolId || undefined,
        advisorId: advisorId || undefined,
      });
      Alert.alert("Success", "Profile updated successfully!");
      setData(updated?.data ?? updated);
      setModalVisible(false);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: color.background }]}>
        <ActivityIndicator size="large" color={color.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.center, { backgroundColor: color.background }]}>
        <Text style={{ color: color.text }}>Unable to load profile</Text>
      </View>
    );
  }

  const userImg = data.image
    ? { uri: data.image }
    : require("../../assets/image/profile.jpg");
  const schoolLogo = data.education?.school?.logo
    ? { uri: data.education.school.logo }
    : null;
  const advisorImg = data.education?.advisor?.image
    ? { uri: data.education.advisor.image }
    : null;

  return (
    <ScrollView style={{ backgroundColor: color.background }}>
      <View style={styles.container}>
        {/* --- User Info --- */}
        <View style={[styles.card, { backgroundColor: color.surface }]}>
          <Image source={userImg} style={styles.profile} />
          <Text style={[styles.name, { color: color.text }]}>
            {data.firstname} {data.lastname}
          </Text>
          <Text style={[styles.sub, { color: color.textSecondary }]}>
            {data.email}
          </Text>
          <Text style={[styles.sub, { color: color.textSecondary }]}>
            Student ID: {data.education?.studentId}
          </Text>
          <Text style={[styles.sub, { color: color.textSecondary }]}>
            Major: {data.education?.major}
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: color.primary }]}
            onPress={openModal}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* --- School Info --- */}
        {data.education?.school && (
          <View style={[styles.card, { backgroundColor: color.surface }]}>
            <Text style={[styles.cardTitle, { color: color.primary }]}>
              School Information
            </Text>
            {schoolLogo && <Image source={schoolLogo} style={styles.logo} />}
            <Text style={[styles.sub, { color: color.text }]}>
              Name: {data.education.school.name}
            </Text>
            <Text style={[styles.sub, { color: color.text }]}>
              Province: {data.education.school.province}
            </Text>
          </View>
        )}

        {/* --- Advisor Info --- */}
        {data.education?.advisor && (
          <View style={[styles.card, { backgroundColor: color.surface }]}>
            <Text style={[styles.cardTitle, { color: color.primary }]}>
              Advisor Information
            </Text>
            {advisorImg && <Image source={advisorImg} style={styles.logo} />}
            <Text style={[styles.sub, { color: color.text }]}>
              Name: {data.education.advisor.name}
            </Text>
            <Text style={[styles.sub, { color: color.text }]}>
              Email: {data.education.advisor.email}
            </Text>
          </View>
        )}

        {/* --- Modal for Edit --- */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: color.surface }]}>
              <Text style={[styles.modalTitle, { color: color.text }]}>
                Edit Profile
              </Text>

              <TextInput
                value={firstname}
                onChangeText={setFirstname}
                placeholder="Firstname"
                placeholderTextColor={color.textSecondary}
                style={[styles.input, { borderColor: color.textSecondary, color: color.text }]}
              />
              <TextInput
                value={lastname}
                onChangeText={setLastname}
                placeholder="Lastname"
                placeholderTextColor={color.textSecondary}
                style={[styles.input, { borderColor: color.textSecondary, color: color.text }]}
              />
              <TextInput
                value={studentId}
                onChangeText={setStudentId}
                placeholder="Student ID"
                placeholderTextColor={color.textSecondary}
                style={[styles.input, { borderColor: color.textSecondary, color: color.text }]}
              />
              <TextInput
                value={schoolId}
                onChangeText={setSchoolId}
                placeholder="School ID (optional)"
                placeholderTextColor={color.textSecondary}
                style={[styles.input, { borderColor: color.textSecondary, color: color.text }]}
              />
              <TextInput
                value={advisorId}
                onChangeText={setAdvisorId}
                placeholder="Advisor ID (optional)"
                placeholderTextColor={color.textSecondary}
                style={[styles.input, { borderColor: color.textSecondary, color: color.text }]}
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: color.primary }]}
                  onPress={handleSave}
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
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  profile: {
    height: 128,
    width: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: "#4a90e2",
    marginBottom: 10,
  },
  logo: { height: 80, width: 80, marginVertical: 10, borderRadius: 10 },
  name: { fontSize: 22, fontWeight: "700" },
  sub: { fontSize: 14, marginTop: 2 },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  modalContent: { width: "90%", padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 14 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", marginHorizontal: 4 },
});
