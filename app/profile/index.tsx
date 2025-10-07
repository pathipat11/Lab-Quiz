import { useEffect, useRef, useState } from "react";
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
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { getProfile, updateProfile } from "../../services/authService";

export default function Profile() {
  const { color, isDarkMode } = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // ฟิลด์ที่จะแก้ไข
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [studentId, setStudentId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [advisorId, setAdvisorId] = useState("");

  // ปุ่มเด้งนุ่ม ๆ
  const editScale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(editScale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(editScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }).start();

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

  const userImg = data.image ? { uri: data.image } : require("../../assets/image/profile.jpg");
  const schoolLogo = data.education?.school?.logo ? { uri: data.education.school.logo } : null;
  const advisorImg = data.education?.advisor?.image ? { uri: data.education.advisor.image } : null;

  return (
    <ScrollView style={{ backgroundColor: color.background }} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header gradient + avatar */}
      <LinearGradient
        colors={isDarkMode ? ["#18181a", "#0f0f10"] : ["#ffb86c", "#ff708e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatarWrap}>
          {/* วงแหวนรอบอวาตาร์แบบ IG */}
          <LinearGradient
            colors={isDarkMode ? ["#8e44ad", "#2980b9"] : ["#f58529", "#dd2a7b"]}
            style={styles.ring}
          >
            <View style={[styles.ringInner, { backgroundColor: color.background }]}>
              <Image source={userImg} style={styles.profileImg} />
            </View>
          </LinearGradient>
        </View>

        <Text style={[styles.displayName, { color: "#fff" }]}>
          {data.firstname} {data.lastname}
        </Text>
        <Text style={[styles.email, { color: "#ffffffcc" }]}>{data.email}</Text>

        {/* quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.statNum}>
              {data.education?.studentId || "-"}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.statLabel}>
              Student ID
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.statNum}>
              {data.education?.enrollmentYear || "-"}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.statLabel}>
              Year
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.statNum}>
              {data.education?.major || "-"}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.statLabel}>
              Major
            </Text>
          </View>
        </View>


        <Animated.View style={{ transform: [{ scale: editScale }] }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={pressIn}
            onPressOut={pressOut}
            style={[styles.editBtn, { backgroundColor: "#ffffff22", borderColor: "#ffffff55" }]}
            onPress={openModal}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Edit Profile</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <View style={styles.body}>
        {/* About card */}
        <View style={[styles.card, styles.shadow, { backgroundColor: color.surface }]}>
          <Text style={[styles.cardTitle, { color: color.primary }]}>ข้อมูลของฉัน</Text>
          <Row label="ชื่อ" value={`${data.firstname || "-"} ${data.lastname || ""}`} color={color} />
          <Row label="อีเมล" value={data.email || "-"} color={color} />
          <Row label="รหัสนักศึกษา" value={data.education?.studentId || "-"} color={color} />
          <Row label="ชั้นปี" value={data.education?.enrollmentYear || "-"} color={color} />
          <Row label="สาขา" value={data.education?.major || "-"} color={color} />
        </View>

        {/* School & Advisor card */}
        {(data.education?.school || data.education?.advisor) && (
          <View style={[styles.card, styles.shadow, { backgroundColor: color.surface }]}>
            <Text style={[styles.cardTitle, { color: color.primary }]}>ข้อมูลสถานศึกษา</Text>

            {data.education?.school && (
              <View style={styles.splitRow}>
                <View style={styles.splitCol}>
                  <Text style={[styles.sectionLabel, { color: color.textSecondary }]}>School</Text>
                  {schoolLogo && <Image source={schoolLogo} style={styles.schoolLogo} />}
                  <Text style={[styles.sectionValue, { color: color.text }]}>{data.education.school.name}</Text>
                  <Text style={[styles.sectionValue, { color: color.text }]}>{data.education.school.province}</Text>
                </View>

                {data.education?.advisor && (
                  <View style={styles.splitCol}>
                    <Text style={[styles.sectionLabel, { color: color.textSecondary }]}>Advisor</Text>
                    {advisorImg && <Image source={advisorImg} style={styles.schoolLogo} />}
                    <Text style={[styles.sectionValue, { color: color.text }]}>{data.education.advisor.name}</Text>
                    <Text style={[styles.sectionValue, { color: color.text }]}>{data.education.advisor.email}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Modal แก้ไข */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.shadow, { backgroundColor: color.surface }]}>
            <Text style={[styles.modalTitle, { color: color.text }]}>Edit Profile</Text>

            <TextField placeholder="Firstname" value={firstname} onChangeText={setFirstname} color={color} />
            <TextField placeholder="Lastname" value={lastname} onChangeText={setLastname} color={color} />
            <TextField placeholder="Student ID" value={studentId} onChangeText={setStudentId} color={color} />
            <TextField placeholder="School ID (optional)" value={schoolId} onChangeText={setSchoolId} color={color} />
            <TextField placeholder="Advisor ID (optional)" value={advisorId} onChangeText={setAdvisorId} color={color} />

            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: color.primary }]} onPress={handleSave}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#a3a3a3" }]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------- Sub components ---------- */
const Row = ({ label, value, color }: { label: string; value?: string; color: any }) => (
  <View style={rowStyles.row}>
    <Text style={[rowStyles.label, { color: color.textSecondary }]}>{label}</Text>
    <Text style={[rowStyles.value, { color: color.text }]} numberOfLines={1}>
      {value || "-"}
    </Text>
  </View>
);

const TextField = ({
  placeholder,
  value,
  onChangeText,
  color,
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  color: any;
}) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={color.textSecondary}
    style={[
      styles.input,
      {
        borderColor: color.textSecondary + "55",
        color: color.text,
        backgroundColor: color.surface,
      },
    ]}
  />
);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingTop: 36,
    paddingBottom: 18,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 16,
  },

  avatarWrap: { marginBottom: 10 },
  ring: { padding: 3, borderRadius: 90 },
  ringInner: { padding: 3, borderRadius: 84 },
  profileImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  displayName: { fontSize: 22, fontWeight: "800" },
  email: { fontSize: 13, marginTop: 2 },

  statsRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    columnGap: 12,
    rowGap: 10,
    marginTop: 10,
  },
  statBox: {
    alignItems: "center",
    flexBasis: "31%",
    maxWidth: "33%",
  },
  statNum: { 
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },
  statLabel: { 
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffffcc",
  },

  editBtn: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },

  body: { padding: 16 },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },

  splitRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  splitCol: {
    flexGrow: 1,
    minWidth: "46%",
    alignItems: "center",
    gap: 6,
  },
  schoolLogo: { height: 70, width: 70, borderRadius: 12 },

  sectionLabel: { fontSize: 12, fontWeight: "700" },
  sectionValue: { fontSize: 13, fontWeight: "600" },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 14,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  // เงาเนียน ๆ ทุกแพลตฟอร์ม
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.10,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
    }),
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(127,127,127,0.12)",
  },
  label: { fontWeight: "700" },
  value: { fontWeight: "700", maxWidth: "60%", textAlign: "right" },
});
