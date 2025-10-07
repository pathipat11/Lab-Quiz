// app/main.tsx
import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    Image,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Animated,
    TouchableWithoutFeedback,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../services/authService";

// ===== Animated Card =====
type AnimatedCardProps = {
    children: React.ReactNode;
    color: {
        surface: string;
    };
};
const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, color }) => {
    const scale = useRef(new Animated.Value(1)).current;
    return (
        <TouchableWithoutFeedback
        onPressIn={() =>
            Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()
        }
        onPressOut={() =>
            Animated.spring(scale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start()
        }
        >
        <Animated.View
            style={[styles.card, { backgroundColor: color.surface, transform: [{ scale }] }]}
        >
            {children}
        </Animated.View>
        </TouchableWithoutFeedback>
    );
};

// ===== Home =====
const Home: React.FC = () => {
    const { color } = useTheme();
    const router = useRouter();

    type MiniUser = {
        firstname?: string;
        lastname?: string;
        email?: string;
        image?: string;
        education?: { image?: string; enrollmentYear?: string; studentId?: string };
    };
    const [me, setMe] = useState<MiniUser | null>(null);

    useEffect(() => {
        // โหลดข้อมูลโปรไฟล์ (ถ้ามี token)
        (async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) return;
            const p = await getProfile(); // คุณมี service นี้แล้ว
            setMe({
            firstname: p.firstname ?? p.username,
            lastname: p.lastname,
            email: p.email,
            image: p.image ?? p?.education?.image,
            education: {
                image: p?.education?.image,
                enrollmentYear: p?.education?.enrollmentYear,
                studentId: p?.education?.studentId,
            },
            });
        } catch {
            // เงียบไว้ ไม่บล็อกหน้า home
        }
        })();
    }, []);

    const avatarSrc =
        me?.image && me.image.length > 4
        ? { uri: me.image }
        : require("../assets/image/profile.jpg");

    const yearChips = ["2565", "2566", "2567", "2568"];

    return (
        <ScrollView style={{ backgroundColor: color.background }}>
        <View style={styles.container}>
            {/* Header + Avatar */}
            <View style={styles.headerRow}>
            <View>
                <Text style={[styles.hello, { color: color.text }]}>
                สวัสดี{me?.firstname ? `, ${me.firstname}` : ""} 👋
                </Text>
                <Text style={{ color: color.textSecondary }}>
                {me?.email ?? "พร้อมใช้งานระบบ Classroom"}
                </Text>
            </View>

            <TouchableOpacity onPress={() => router.push("/profile")}>
                <Image source={avatarSrc} style={styles.profile} />
            </TouchableOpacity>
            </View>

            {/* Profile quick info */}
            <AnimatedCard color={color}>
            <Text style={[styles.cardTitle, { color: color.primary }]}>ข้อมูลของฉัน</Text>
            <View style={styles.infoRow}>
                <Text style={[styles.label, { color: color.textSecondary }]}>ชื่อ</Text>
                <Text style={[styles.value, { color: color.text }]}>
                {me?.firstname || "-"} {me?.lastname || ""}
                </Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={[styles.label, { color: color.textSecondary }]}>อีเมล</Text>
                <Text style={[styles.value, { color: color.text }]}>{me?.email || "-"}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={[styles.label, { color: color.textSecondary }]}>รหัสนักศึกษา</Text>
                <Text style={[styles.value, { color: color.text }]}>
                {me?.education?.studentId || "-"}
                </Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={[styles.label, { color: color.textSecondary }]}>ชั้นปี</Text>
                <Text style={[styles.value, { color: color.text }]}>
                {me?.education?.enrollmentYear || "-"}
                </Text>
            </View>

            <Link href="/profile" style={[styles.linkBtn, { backgroundColor: color.primary }]}>
                <Text style={styles.linkBtnText}>ไปที่โปรไฟล์</Text>
            </Link>
            </AnimatedCard>

            {/* Quick actions */}
            <View style={styles.grid}>
            <Link href="/feed" style={[styles.tile, { backgroundColor: color.surface }]}>
                <Text style={[styles.tileIcon, { color: color.primary }]}>📰</Text>
                <Text style={[styles.tileLabel, { color: color.text }]}>ฟีดสถานะ</Text>
                <Text style={{ color: color.textSecondary, fontSize: 12 }}>ดู/โพสต์/ไลก์/คอมเมนต์</Text>
            </Link>

            <View style={[styles.tile, { backgroundColor: color.surface }]}>
                <Text style={[styles.tileIcon, { color: color.primary }]}>🎓</Text>
                <Text style={[styles.tileLabel, { color: color.text }]}>รายชื่อรุ่น</Text>
                <View style={styles.chipsRow}>
                {yearChips.map((y) => (
                    <Link key={y} href={`/class/${y}`} style={[styles.chip, { borderColor: "#EAEAEA" }]}>
                    <Text style={{ fontWeight: "600", color: color.text }}>{y}</Text>
                    </Link>
                ))}
                </View>
            </View>

            <Link href="/setting" style={[styles.tile, { backgroundColor: color.surface }]}>
                <Text style={[styles.tileIcon, { color: color.primary }]}>⚙️</Text>
                <Text style={[styles.tileLabel, { color: color.text }]}>ตั้งค่า</Text>
                <Text style={{ color: color.textSecondary, fontSize: 12 }}>ธีม/ไบโอเมตริก/ออกจากระบบ</Text>
            </Link>
            </View>

            {/* Go to docs or anything else */}
            <AnimatedCard color={color}>
            <Text style={[styles.cardTitle, { color: color.primary }]}>ลัดไปหน้าอื่น</Text>
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                <Link href="/feed" style={[styles.smallBtn, { borderColor: "#EAEAEA" }]}>
                <Text style={{ color: color.text }}>เปิดฟีด</Text>
                </Link>
                <Link href="/class/2565" style={[styles.smallBtn, { borderColor: "#EAEAEA" }]}>
                <Text style={{ color: color.text }}>ชั้นปี 2565</Text>
                </Link>
                <Link href="/profile" style={[styles.smallBtn, { borderColor: "#EAEAEA" }]}>
                <Text style={{ color: color.text }}>โปรไฟล์</Text>
                </Link>
            </View>
            </AnimatedCard>
        </View>
        </ScrollView>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
        gap: 16,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    hello: {
        fontSize: 22,
        fontWeight: "700",
    },
    profile: {
        height: 56,
        width: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: "#4a90e2",
    },

    // Card
    card: {
        padding: 16,
        borderRadius: 14,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        gap: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    label: { fontWeight: "600" },
    value: { fontWeight: "600" },

    linkBtn: {
        marginTop: 10,
        alignSelf: "flex-start",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    linkBtnText: { color: "#fff", fontWeight: "700" },

    // Grid quick actions
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    tile: {
        flexGrow: 1,
        minWidth: "46%",
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#EAEAEA",
    },
    tileIcon: { fontSize: 26, marginBottom: 6 },
    tileLabel: { fontWeight: "700", marginBottom: 4 },

    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
        borderWidth: 1,
    },

    smallBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
    },
});
