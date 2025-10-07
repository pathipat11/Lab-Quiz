import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    View, Text, ActivityIndicator, FlatList, TextInput, StyleSheet,
    Image, TouchableOpacity, RefreshControl, ScrollView
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getMembersByYear, ClassMember } from "../../services/classService";
import { useTheme } from "../../context/ThemeContext";

const QUICK_YEARS = ["2560","2561","2562","2563","2564","2565","2566","2567","2568"];

export default function ClassYearScreen() {
    const { color, isDarkMode } = useTheme();
    const { year } = useLocalSearchParams<{ year: string }>();

    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<ClassMember[]>([]);
    const [q, setQ] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // ปีที่ใช้งานจริง (แก้ได้)
    const [yearStr, setYearStr] = useState<string>(year || "");
    // เก็บ error ปี
    const [yearErr, setYearErr] = useState<string | null>(null);

    const load = useCallback(async (y?: string) => {
        const yy = (y ?? yearStr)?.trim();
        if (!yy) { setMembers([]); setLoading(false); return; }
        setLoading(true);
        try {
        const data = await getMembersByYear(yy);
        setMembers(data || []);
        setYearErr(null);
        } catch (e:any) {
        setMembers([]);
        setYearErr("ไม่พบข้อมูลสำหรับปีนี้ หรือเกิดข้อผิดพลาด");
        } finally {
        setLoading(false);
        }
    }, [yearStr]);

    useEffect(() => {
        // โหลดตาม slug ครั้งแรก
        load(year);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }, [load]);

    const onApplyYear = () => {
        // validate เบื้องต้น: ต้องเป็นตัวเลข 4 หลัก
        if (!/^\d{4}$/.test(yearStr)) {
        setYearErr("กรุณากรอกปีเป็นตัวเลข 4 หลัก เช่น 2567");
        return;
        }
        load(yearStr);
    };

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return members;
        return members.filter((m) => {
        const name = `${m.firstname || ""} ${m.lastname || ""}`.toLowerCase();
        const email = (m.email || "").toLowerCase();
        const sid = (m.education?.studentId || "").toLowerCase();
        return name.includes(s) || email.includes(s) || sid.includes(s);
        });
    }, [q, members]);

    const renderItem = ({ item }: { item: ClassMember }) => {
        const avatar =
        item.image?.length ? { uri: item.image }
        : item.education?.image?.length ? { uri: item.education.image }
        : null;

        const initials = `${item.firstname?.[0] || ""}${item.lastname?.[0] || ""}`.toUpperCase();

        return (
        <View style={styles.cardShadow}>
            <View style={[styles.card, { backgroundColor: color.surface }]}>
            <View style={styles.row}>
                {avatar ? (
                <Image source={avatar} style={styles.avatar} />
                ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarText}>{initials || "?"}</Text>
                </View>
                )}
                <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: color.text }]}>
                    {item.firstname} {item.lastname}
                </Text>
                {!!item.email && (
                    <Text style={{ color: color.textSecondary, marginTop: 2 }}>
                    {item.email}
                    </Text>
                )}
                </View>
            </View>

            <View style={styles.badgeRow}>
                {!!item.education?.studentId && (
                <View style={[styles.badge, { backgroundColor: isDarkMode ? "#1f1f1f" : "#f1f5f9" }]}>
                    <Text style={[styles.badgeText, { color: color.text }]}>
                    ID: {item.education.studentId}
                    </Text>
                </View>
                )}
                {!!item.education?.major && (
                <View style={[styles.badge, { backgroundColor: isDarkMode ? "#1f1f1f" : "#f1f5f9" }]}>
                    <Text style={[styles.badgeText, { color: color.text }]}>
                    {item.education.major}
                    </Text>
                </View>
                )}
            </View>
            </View>
        </View>
        );
    };

    if (loading) {
        return (
        <View style={[styles.center, { backgroundColor: color.background }]}>
            <ActivityIndicator color={color.primary} size="large" />
        </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: color.background }}>
        {/* Header */}
        <View style={styles.headerWrap}>
            <Text style={[styles.title, { color: color.text }]}>
            รายชื่อนักศึกษา ชั้นปี {yearStr || year}
            </Text>
            <Text style={{ color: color.textSecondary }}>
            ทั้งหมด {filtered.length} คน
            </Text>
        </View>

        {/* Year picker + quick chips */}
        <View style={[styles.searchShadow]}>
            <View
            style={[
                styles.yearRow,
                { backgroundColor: color.surface, borderColor: isDarkMode ? "#2a2a2a" : "#ffffff00" },
            ]}
            >
            <TextInput
                value={yearStr}
                onChangeText={(t) => { setYearStr(t); setYearErr(null); }}
                keyboardType="number-pad"
                placeholder="พิมพ์ปี เช่น 2567"
                placeholderTextColor={color.textSecondary}
                style={[styles.yearInput, { color: color.text }]}
                maxLength={4}
                onSubmitEditing={onApplyYear}
            />
            <TouchableOpacity onPress={onApplyYear} style={[styles.yearBtn, { backgroundColor: color.primary }]}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>ค้นหา</Text>
            </TouchableOpacity>
            </View>

            {!!yearErr && (
            <Text style={{ color: "#e74c3c", marginTop: 6, fontWeight: "600" }}>{yearErr}</Text>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
                {QUICK_YEARS.map((y) => {
                const active = String(y) === String(yearStr);
                return (
                    <TouchableOpacity
                    key={y}
                    onPress={() => { setYearStr(y); setYearErr(null); load(y); }}
                    style={[
                        styles.yearChip,
                        {
                        backgroundColor: active ? color.primary : (isDarkMode ? "#1f1f1f" : "#f1f5f9"),
                        },
                    ]}
                    >
                    <Text style={{ color: active ? "#fff" : color.text, fontWeight: "800" }}>{y}</Text>
                    </TouchableOpacity>
                );
                })}
            </View>
            </ScrollView>
        </View>

        {/* List */}
        <FlatList
            data={filtered}
            keyExtractor={(m) => m._id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
            <View style={styles.emptyWrap}>
                <Text style={{ color: color.textSecondary }}>
                ไม่พบรายชื่อในปี {yearStr || year} ที่ตรงกับ “{q}”
                </Text>
            </View>
            }
            ListHeaderComponent={
            <View style={{ paddingHorizontal: 0, paddingBottom: 8 }}>
                <View
                style={[
                    styles.search,
                    {
                    backgroundColor: color.surface,
                    borderColor: isDarkMode ? "#2a2a2a" : "#ffffff00",
                    },
                ]}
                >
                <TextInput
                    value={q}
                    onChangeText={setQ}
                    placeholder="ค้นหา ชื่อ/อีเมล/รหัสนักศึกษา"
                    placeholderTextColor={color.textSecondary}
                    style={[styles.input, { color: color.text }]}
                />
                {!!q && (
                    <TouchableOpacity onPress={() => setQ("")} style={styles.clearBtn}>
                    <Text style={{ color: color.textSecondary, fontWeight: "700" }}>×</Text>
                    </TouchableOpacity>
                )}
                </View>
            </View>
            }
        />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    headerWrap: { paddingHorizontal: 16, paddingTop: 16 },
    title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },

    searchShadow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },

    // แถวกรอกปี + ปุ่ม
    yearRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderRadius: 12,
        padding: 10,
        borderWidth: StyleSheet.hairlineWidth,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    yearInput: { flex: 1, fontSize: 14, fontWeight: "700", letterSpacing: 0.5 },
    yearBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },

    yearChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },

    // ช่องค้นหาใน list header
    search: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: StyleSheet.hairlineWidth,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        flexDirection: "row",
        alignItems: "center",
    },
    input: { flex: 1, fontSize: 14, fontWeight: "600" },
    clearBtn: { paddingLeft: 8, paddingVertical: 4 },

    cardShadow: { paddingHorizontal: 16 },
    card: {
        borderRadius: 14,
        padding: 14,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24 },
    avatarFallback: { backgroundColor: "#4a90e2", alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontWeight: "800", fontSize: 16 },

    name: { fontSize: 16, fontWeight: "800" },

    badgeRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
    badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
    badgeText: { fontSize: 12, fontWeight: "700" },

    emptyWrap: { paddingTop: 40, alignItems: "center" },
});
