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
import BottomBar from "../app/components/BottomBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ===== Animated Card =====
type AnimatedCardProps = {
    children: React.ReactNode;
    color: { surface: string };
};
const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, color }) => {
    const scale = useRef(new Animated.Value(1)).current;
    return (
        <TouchableWithoutFeedback
        onPressIn={() =>
            Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()
        }
        onPressOut={() =>
            Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
            }).start()
        }
        >
        <Animated.View
            style={[
            styles.card,
            { backgroundColor: color.surface, transform: [{ scale }] },
            ]}
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
    const insets = useSafeAreaInsets();

    type MiniUser = {
        firstname?: string;
        lastname?: string;
        email?: string;
        image?: string;
        education?: { image?: string; enrollmentYear?: string; studentId?: string };
    };
    const [me, setMe] = useState<MiniUser | null>(null);

    useEffect(() => {
        (async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (!token) return;
            const p = await getProfile();
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
        } catch {}
        })();
    }, []);

    const avatarSrc =
        me?.image && me.image.length > 4
        ? { uri: me.image }
        : require("../assets/image/profile.jpg");

    const yearChips = ["2560", "2561", "2562", "2563", "2564", "2565", "2566", "2567", "2568"];

    // ความสูงแถบล่างจาก BottomBar.tsx
    const TAB_H = 62;
    const bottomPad = TAB_H + insets.bottom + 10;

    return (
        <View style={{ flex: 1, backgroundColor: color.background }}>
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: bottomPad }}
        >
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
                <Text style={[styles.cardTitle, { color: color.primary }]}>
                ข้อมูลของฉัน
                </Text>
                <View style={styles.infoRow}>
                <Text style={[styles.label, { color: color.textSecondary }]}>
                    ชื่อ
                </Text>
                <Text style={[styles.value, { color: color.text }]}>
                    {me?.firstname || "-"} {me?.lastname || ""}
                </Text>
                </View>
                <View style={styles.infoRow}>
                <Text style={[styles.label, { color: color.textSecondary }]}>
                    อีเมล
                </Text>
                <Text style={[styles.value, { color: color.text }]}>
                    {me?.email || "-"}
                </Text>
                </View>
                <View style={styles.infoRow}>
                <Text style={[styles.label, { color: color.textSecondary }]}>
                    รหัสนักศึกษา
                </Text>
                <Text style={[styles.value, { color: color.text }]}>
                    {me?.education?.studentId || "-"}
                </Text>
                </View>
                <View style={styles.infoRow}>
                <Text style={[styles.label, { color: color.textSecondary }]}>
                    ชั้นปี
                </Text>
                <Text style={[styles.value, { color: color.text }]}>
                    {me?.education?.enrollmentYear || "-"}
                </Text>
                </View>

                <Link
                href="/profile"
                style={[styles.linkBtn, { backgroundColor: color.primary }]}
                >
                <Text style={styles.linkBtnText}>ไปที่โปรไฟล์</Text>
                </Link>
            </AnimatedCard>

           {/* Quick actions */}
            <View style={styles.grid}>
                <TileCard href="/feed" bg={color.surface}>
                    {/* <Text style={[styles.tileIcon, { color: color.primary }]}>📰</Text> */}
                    <Text style={[styles.tileLabel, { color: color.primary }]}>ฟีดสถานะ</Text>
                    <Text style={{ color: color.textSecondary, fontSize: 12 }}>ดู/โพสต์/ไลก์/คอมเมนต์</Text>
                </TileCard>

                <TileCard bg={color.surface}>
                    {/* <Text style={[styles.tileIcon, { color: color.primary }]}>🎓</Text> */}
                    <Text style={[styles.tileLabel, { color: color.primary }]}>รายชื่อรุ่น</Text>

                    <View style={styles.chipsRow}>
                    {yearChips.map((y) => (
                        <Link key={y} href={`/class/${y}`} asChild>
                        <TouchableOpacity activeOpacity={0.9}>
                            <View style={[styles.chipShadowWrap]}>
                            <View style={[styles.chipInner, { backgroundColor: color.surface }]}>
                                <Text style={{ fontWeight: "700", color: color.text }}>{y}</Text>
                            </View>
                            </View>
                        </TouchableOpacity>
                        </Link>
                    ))}
                    </View>
                </TileCard>

                <TileCard href="/setting" bg={color.surface}>
                    {/* <Text style={[styles.tileIcon, { color: color.primary }]}>⚙️</Text> */}
                    <Text style={[styles.tileLabel, { color: color.primary }]}>ตั้งค่า</Text>
                    <Text style={{ color: color.textSecondary, fontSize: 12 }}>ธีม/ไบโอเมตริก/ออกจากระบบ</Text>
                </TileCard>
            </View>

            {/* Quick links */}
            <AnimatedCard color={color}>
                <Text style={[styles.cardTitle, { color: color.primary }]}>ลัดไปหน้าอื่น</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    <Link href="/feed" asChild>
                    <TouchableOpacity activeOpacity={0.9}>
                        <View style={styles.smallShadowWrap}>
                        <View style={[styles.smallInner, { backgroundColor: color.surface }]}>
                            <Text style={{ color: color.text, fontWeight: "600" }}>เปิดฟีด</Text>
                        </View>
                        </View>
                    </TouchableOpacity>
                    </Link>
                    <Link href="/class/2565" asChild>
                    <TouchableOpacity activeOpacity={0.9}>
                        <View style={styles.smallShadowWrap}>
                        <View style={[styles.smallInner, { backgroundColor: color.surface }]}>
                            <Text style={{ color: color.text, fontWeight: "600" }}>ชั้นปี 2565</Text>
                        </View>
                        </View>
                    </TouchableOpacity>
                    </Link>
                    <Link href="/profile" asChild>
                    <TouchableOpacity activeOpacity={0.9}>
                        <View style={styles.smallShadowWrap}>
                        <View style={[styles.smallInner, { backgroundColor: color.surface }]}>
                            <Text style={{ color: color.text, fontWeight: "600" }}>โปรไฟล์</Text>
                        </View>
                        </View>
                    </TouchableOpacity>
                    </Link>
                </View>
            </AnimatedCard>
            </View>
        </ScrollView>

        {/* IG-style bottom bar */}
        <BottomBar avatar={avatarSrc} />
        </View>
    );
};

const TileCard: React.FC<{ onPress?: () => void; href?: string; bg: string; children: React.ReactNode }> = ({ onPress, href, bg, children }) => {
    const content = (
        <View style={styles.tileShadowWrap}>
        <View style={[styles.tileInner, { backgroundColor: bg }]}>
            {children}
        </View>
        </View>
    );

    if (href) {
        // ใช้ Link asChild เพื่อให้ Touchable รับสไตล์/กดได้
        return (
        <Link href={href} asChild>
            <TouchableOpacity activeOpacity={0.9} style={{ width: "100%" }}>
            {content}
            </TouchableOpacity>
        </Link>
        );
    }
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ width: "100%" }}>
        {content}
        </TouchableOpacity>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 16 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    hello: { fontSize: 22, fontWeight: "700" },
    profile: { height: 56, width: 56, borderRadius: 28, borderWidth: 2, borderColor: "#4a90e2" },

    card: {
        padding: 16,
        borderRadius: 14,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        gap: 8,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
    infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
    label: { fontWeight: "600" },
    value: { fontWeight: "600" },

    linkBtn: { marginTop: 10, alignSelf: "flex-end", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
    linkBtnText: { color: "#fff", fontWeight: "700" },

    grid: { flexDirection: "row", flexWrap: "wrap", rowGap: 12 },
    tile: {
        flexGrow: 1,
        minWidth: "48%",
        padding: 16,
        borderRadius: 14,
    },
    tileShadowWrap: {
        borderRadius: 14,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    tileInner: {
        borderRadius: 14,
        overflow: "hidden",
        padding: 16,
        minWidth: "48%",
    },
    tileIcon: { fontSize: 26, marginBottom: 6 },
    tileLabel: { fontWeight: "700", marginBottom: 4 },

    shadow: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between", marginTop: 6 },
    chip: {
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start",
        // backgroundColor will be set inline
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    chipShadowWrap: {
        borderRadius: 999,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    chipInner: {
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start",
        overflow: "hidden",
    },

    smallBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },

    smallShadowWrap: {
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        marginRight: 10,
        marginBottom: 10,
    },
    smallInner: {
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
});