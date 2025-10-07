import { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, Text, TextInput, FlatList, RefreshControl,
  TouchableOpacity, Image, StyleSheet, Alert, Platform
} from "react-native";
import {
  listStatuses, createStatus, likeStatus, unlikeStatus,
  StatusItem, displayName, isMine, deleteStatus, didILike
} from "../../services/statusService";
import { useTheme } from "../../context/ThemeContext";
import { Link, useFocusEffect } from "expo-router";
import { getProfile } from "../../services/authService";

// helper: เวลาแบบสั้น
const timeAgo = (iso: string) => {
    const d = new Date(iso).getTime();
    const s = Math.floor((Date.now() - d) / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
    const dd = Math.floor(h / 24); if (dd < 7) return `${dd}d`;
    return new Date(iso).toLocaleDateString();
};

export default function Feed() {
    const { color, isDarkMode } = useTheme();
    const [posts, setPosts] = useState<StatusItem[]>([]);
    const [content, setContent] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [myEmail, setMyEmail] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
        try {
            const p = await getProfile();
            setMyEmail(p?.email ?? p?.data?.email ?? null);
        } catch {}
        })();
    }, []);

    const load = useCallback(async () => {
        const data = await listStatuses();
        setPosts(data);
    }, []);

    useEffect(() => { load(); }, [load]);
    useFocusEffect(useCallback(() => { load(); }, [load]));

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }, [load]);

    // โพสต์แบบ optimistic
    const onSubmit = async () => {
        const text = content.trim();
        if (!text || submitting) return;
        setSubmitting(true);

        // optimistic item (ชั่วคราว)
        const tempId = `temp-${Date.now()}`;
        const optimistic: StatusItem = {
        _id: tempId,
        content: text,
        createdBy: myEmail || "ฉัน",
        like: [],
        likeCount: 0,
        hasLiked: false,
        comment: [],
        createdAt: new Date().toISOString(),
        };
        setPosts((cur) => [optimistic, ...cur]);
        setContent("");

        try {
        await createStatus(text);
        await load(); // sync ของจริง
        } catch (e) {
        // rollback
        setPosts((cur) => cur.filter((p) => p._id !== tempId));
        Alert.alert("โพสต์ไม่สำเร็จ", "กรุณาลองอีกครั้ง");
        } finally {
        setSubmitting(false);
        }
    };

    // like/unlike แบบ optimistic
    const onToggleLike = async (p: StatusItem) => {
        const iLiked = didILike(p, myEmail);
        // อัปเดตใน state ก่อน
        setPosts((cur) =>
        cur.map((it) => {
            if (it._id !== p._id) return it;
            const count = typeof it.likeCount === "number" ? it.likeCount : (it.like?.length ?? 0);
            if (iLiked) {
            // unlike
            return {
                ...it,
                hasLiked: false,
                likeCount: Math.max(0, count - 1),
                like: (it.like || []).filter((v: any) =>
                typeof v === "string" ? v.toLowerCase() !== (myEmail || "").toLowerCase()
                                        : (v?.email || "").toLowerCase() !== (myEmail || "").toLowerCase()
                ),
            };
            } else {
            // like
            return {
                ...it,
                hasLiked: true,
                likeCount: count + 1,
                like: [...(it.like || []), myEmail || "me"],
            };
            }
        })
        );

        try {
        if (iLiked) await unlikeStatus(p._id);
        else await likeStatus(p._id);
        // ไม่ต้อง load ทั้งลิสต์ทุกครั้ง ให้เชื่อ state ไปก่อน
        } catch (e: any) {
        // ถ้า error ให้รีโหลด sync
        await load();
        Alert.alert("ไม่สามารถกดถูกใจ", e?.message ?? "เกิดข้อผิดพลาด");
        }
    };

    const onDeletePost = async (id: string) => {
        Alert.alert("ลบโพสต์", "ต้องการลบโพสต์นี้หรือไม่?", [
        { text: "ยกเลิก", style: "cancel" },
        {
            text: "ลบ", style: "destructive", onPress: async () => {
            // optimistic remove
            const prev = posts;
            setPosts((cur) => cur.filter((p) => p._id !== id));
            try {
                await deleteStatus(id);
            } catch (e: any) {
                setPosts(prev); // rollback
                Alert.alert("ลบโพสต์ไม่สำเร็จ", e?.message ?? "เกิดข้อผิดพลาด (500)");
            }
            }
        }
        ]);
    };

    const getAvatarSource = (cb: StatusItem["createdBy"]) => {
        if (!cb) return require("../../assets/image/profile.jpg");
        if (typeof cb === "string") return require("../../assets/image/profile.jpg");
        const url = cb.image || "";
        return url && url.length > 4
            ? { uri: url }
            : require("../../assets/image/profile.jpg");
    };

    const getAvatarInfo = (cb: StatusItem["createdBy"]) => {
        if (cb && typeof cb !== "string" && cb.image && cb.image.length > 4) {
            return { type: "image" as const, src: { uri: cb.image } };
        }
        let base = "";
        if (!cb) base = "";
        else if (typeof cb === "string") base = cb;
        else base = cb.name || cb.email || cb._id || "";

        base = base.trim();
        const parts = base.split(/\s+/).filter(Boolean);
        const first = parts[0]?.[0] ?? base[0] ?? "?";
        const last =
            parts.length > 1
            ? parts[parts.length - 1][0]
            : (base.includes("@") ? base[0] : "");
        const initials = (first + (last || "")).toUpperCase();

        return { type: "initials" as const, text: initials || "?" };
    };

    const renderItem = useCallback(({ item }: { item: StatusItem }) => {
        const av = getAvatarInfo(item.createdBy);
        const likeCount = typeof item.likeCount === "number"
            ? item.likeCount
            : (item.like?.length ?? 0);

        return (
            <View style={styles.cardShadow}>
            <View style={[styles.card, { backgroundColor: color.surface }]}>
                <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                    {av.type === "image" ? (
                    <Image source={av.src} style={styles.avatar} />
                    ) : (
                    <View
                        style={[
                        styles.avatar,
                        styles.avatarFallback,
                        { backgroundColor: isDarkMode ? "#2d2d2d" : "#4a90e2" },
                        ]}
                    >
                        <Text style={styles.avatarText}>{av.text}</Text>
                    </View>
                    )}
                    <View>
                    <Text style={[styles.author, { color: color.text }]}>
                        {displayName(item.createdBy)}
                    </Text>
                    <Text style={[styles.time, { color: color.textSecondary }]}>
                        {timeAgo(item.createdAt)}
                    </Text>
                    </View>
                </View>

                {isMine(item.createdBy, myEmail) && (
                    <TouchableOpacity onPress={() => onDeletePost(item._id)}>
                    <Text style={{ color: "#e74c3c", fontWeight: "700" }}>ลบโพสต์</Text>
                    </TouchableOpacity>
                )}
                </View>

                <Text style={{ color: color.text, marginBottom: 8, lineHeight: 20 }}>
                {item.content}
                </Text>

                <View style={styles.toolbar}>
                <TouchableOpacity onPress={() => onToggleLike(item)} activeOpacity={0.8}>
                    <Text style={[styles.action, { color: color.text }]}>
                    {item.hasLiked ? "💙" : "👍"} {likeCount}
                    </Text>
                </TouchableOpacity>
                <Link href={`/feed/${item._id}`} style={[styles.action, { color: color.primary }]}>
                    💬 {item.comment?.length ?? 0}
                </Link>
                </View>
            </View>
            </View>
        );
    }, [color.surface, color.text, color.textSecondary, color.primary, myEmail, isDarkMode]);


    const keyExtractor = useCallback((i: StatusItem) => i._id, []);

    return (
        <View style={[styles.screen, { backgroundColor: color.background }]}>
        {/* composer */}
        <View style={styles.composerShadow}>
            <View style={[styles.composer, { backgroundColor: color.surface }]}>
            {/* <Text style={[styles.title, { color: color.text }]}>
                สร้างโฟสต์ใหม่
            </Text> */}
            <TextInput
                placeholder="คุณกำลังคิดอะไรอยู่..."
                placeholderTextColor={color.textSecondary}
                value={content}
                onChangeText={setContent}
                style={[styles.input, { color: color.text }]}
                multiline
                maxLength={500}
            />
            <TouchableOpacity
                disabled={submitting || !content.trim()}
                onPress={onSubmit}
                style={[
                styles.postBtn,
                { backgroundColor: submitting || !content.trim() ? "#5a607eff" : "#0e0bbeff" }
                ]}
                activeOpacity={0.9}
            >
                <Text style={{ color: "#fff", fontWeight: "800" }}>โพสต์</Text>
            </TouchableOpacity>
            </View>
        </View>

        <FlatList
            data={posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingVertical: 8, paddingBottom: 16 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
        />
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 22, fontWeight: "800", marginBottom: 6, textAlign: "center" },

    screen: { flex: 1, padding: 14 },

    avatarFallback: {
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 12,
        letterSpacing: 0.5,
    },

    composerShadow: {
        borderRadius: 14,
        ...Platform.select({
        ios: {
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
        },
        android: { elevation: 3 },
        }),
        marginBottom: 10,
    },
    composer: {
        padding: 12,
        borderRadius: 14,
    },
    input: {
        borderRadius: 10,
        padding: 12,
        minHeight: 44,
        lineHeight: 20,
        // พื้นหลังโปร่งเล็กน้อย ให้เหมือนช่องเขียนโพสต์ IG
        backgroundColor: "rgba(127,127,127,0.06)",
        marginBottom: 8,
    },
    postBtn: { alignSelf: "flex-end", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },

    // ----- Card (เงาแทนเส้นขอบ) -----
    cardShadow: {
        ...Platform.select({
        ios: {
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
        },
        android: { elevation: 3 },
        }),
        borderRadius: 12,
    },
    card: {
        borderRadius: 12,
        padding: 12,
    },

    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, justifyContent: "space-between" },
    headerLeft: { flexDirection: "row", alignItems: "center" },
    avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
    author: { fontWeight: "800" },
    time: { fontSize: 12, marginTop: 2 },

    toolbar: { flexDirection: "row", gap: 16, marginTop: 6 },
    action: { fontWeight: "800" },
});
