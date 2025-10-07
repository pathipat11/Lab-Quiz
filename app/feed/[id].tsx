import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    Image,
    RefreshControl,
    Platform,
} from "react-native";
import {
    addComment,
    getStatusById,
    StatusItem,
    displayName,
    isMine,
    deleteComment,
    deleteStatus,
} from "../../services/statusService";
import { useTheme } from "../../context/ThemeContext";
import { getProfile } from "../../services/authService";

/* ---------- helpers ---------- */
const timeAgo = (iso?: string) => {
    if (!iso) return "";
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return "";

  // ระยะเวลา (วินาที)
    let diff = Math.floor((Date.now() - t) / 1000);

    if (diff < 0) diff = 0;
    if (diff < 5) return "now";

    const MIN = 60;
    const HOUR = 60 * MIN;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;   // approx
    const YEAR = 365 * DAY;   // approx

    if (diff < MIN) return `${diff}s`;
    if (diff < HOUR) return `${Math.floor(diff / MIN)}m`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
    if (diff < WEEK) return `${Math.floor(diff / DAY)}d`;
    if (diff < MONTH) return `${Math.floor(diff / WEEK)}w`;
    if (diff < YEAR) return `${Math.floor(diff / MONTH)}mo`;
    return `${Math.floor(diff / YEAR)}y`;
};

const getAvatarInfo = (cb: StatusItem["createdBy"]) => {
    if (cb && typeof cb !== "string" && cb.image && cb.image.length > 4) {
        return { type: "image" as const, src: { uri: cb.image } };
    }
    let base = "";
    if (!cb) base = "";
    else if (typeof cb === "string") base = cb;
    else base = cb.name || cb.email || "";

    base = base.trim();
    const parts = base.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? base[0] ?? "?";
    const last =
        parts.length > 1 ? parts[parts.length - 1][0] : (base.includes("@") ? base[0] : "");
    const initials = (first + (last || "")).toUpperCase();
    return { type: "initials" as const, text: initials || "?" };
};
/* ----------------------------- */

export default function PostDetail() {
    const { color, isDarkMode } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [post, setPost] = useState<StatusItem | null>(null);
    const [text, setText] = useState("");
    const [myEmail, setMyEmail] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [adding, setAdding] = useState(false);
    const router = useRouter();

    useEffect(() => {
        (async () => {
        try {
            const p = await getProfile();
            setMyEmail(p?.email ?? p?.data?.email ?? null);
        } catch {}
        })();
    }, []);

    const load = useCallback(async () => {
        if (!id) return;
        const data = await getStatusById(id);
        setPost(data);
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }, [load]);

    const onAdd = async () => {
        const msg = text.trim();
        if (!msg || !post || adding) return;
        setAdding(true);

        // optimistic append
        const tempId = `temp-${Date.now()}`;
        const optimistic = {
        _id: tempId,
        content: msg,
        createdBy: myEmail || "ฉัน",
        like: [],
        createdAt: new Date().toISOString(),
        } as StatusItem["comment"][number];

        setPost((cur) => (cur ? { ...cur, comment: [...(cur.comment || []), optimistic] } : cur));
        setText("");

        try {
        await addComment(id!, msg);
        await load();
        } catch (e: any) {
        // rollback
        setPost((cur) =>
            cur ? { ...cur, comment: (cur.comment || []).filter((c) => c._id !== tempId) } : cur
        );
        Alert.alert("ส่งคอมเมนต์ไม่สำเร็จ", e?.message ?? "เกิดข้อผิดพลาด");
        } finally {
        setAdding(false);
        }
    };

    const onDeleteComment = async (cid: string) => {
        Alert.alert("ลบคอมเมนต์", "ต้องการลบคอมเมนต์นี้หรือไม่?", [
        { text: "ยกเลิก", style: "cancel" },
        {
            text: "ลบ",
            style: "destructive",
            onPress: async () => {
            if (!post) return;
            // optimistic remove
            const prev = post.comment || [];
            setPost({ ...post, comment: prev.filter((c) => c._id !== cid) });
            try {
                await deleteComment(cid, id!);
            } catch (e: any) {
                setPost({ ...post, comment: prev }); // rollback
                Alert.alert("ลบคอมเมนต์ไม่สำเร็จ", e?.message ?? "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
            }
            },
        },
        ]);
    };

    const onDeletePost = async () => {
        Alert.alert("ลบโพสต์", "ต้องการลบโพสต์นี้หรือไม่?", [
        { text: "ยกเลิก", style: "cancel" },
        {
            text: "ลบ",
            style: "destructive",
            onPress: async () => {
            try {
                await deleteStatus(id!);
                router.back(); // กลับไปฟีด
            } catch (e: any) {
                Alert.alert("ลบโพสต์ไม่สำเร็จ", e?.message ?? "เกิดข้อผิดพลาด (500)");
            }
            },
        },
        ]);
    };

    if (!post) return null;

    const minePost = isMine(post.createdBy, myEmail);
    const postAvatar = getAvatarInfo(post.createdBy);
    const likeCount =
        typeof post.likeCount === "number" ? post.likeCount : (post.like?.length ?? 0);

    /* ---- header (โพสต์) ไว้เป็น FlatList header ---- */
    const ListHeader = (
    <View style={styles.cardShadow}>
        <View style={[styles.card, { backgroundColor: color.surface }]}>

        {/* author row + delete on right */}
        <View style={styles.headerRow}>
            {/* ซ้าย: avatar + ชื่อ + เวลา */}
            <View style={styles.headerLeft}>
            {postAvatar.type === "image" ? (
                <Image source={postAvatar.src} style={styles.avatar} />
            ) : (
                <View
                style={[
                    styles.avatar,
                    styles.avatarFallback,
                    { backgroundColor: isDarkMode ? "#2d2d2d" : "#4a90e2" },
                ]}
                >
                <Text style={styles.avatarText}>{postAvatar.text}</Text>
                </View>
            )}

            <View>
                <Text style={[styles.author, { color: color.text }]}>
                {displayName(post.createdBy)}
                </Text>
                <Text style={[styles.time, { color: color.textSecondary }]}>
                {timeAgo(post.createdAt)}
                </Text>
            </View>
            </View>

            {/* ขวา: ลบโพสต์ */}
            {minePost && (
            <TouchableOpacity onPress={onDeletePost} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ color: "#e74c3c", fontWeight: "800" }}>ลบโพสต์</Text>
            </TouchableOpacity>
            )}
        </View>

        {/* content */}
        <Text style={[styles.postText, { color: color.text }]}>{post.content}</Text>

        {/* meta */}
        <View style={styles.metaRow}>
            <Text style={{ color: color.textSecondary, fontWeight: "700" }}>👍 {likeCount}</Text>
            <Text style={{ color: color.textSecondary, fontWeight: "700" }}>
            💬 {post.comment?.length ?? 0}
            </Text>
        </View>
        </View>
    </View>
    );


    const renderComment = ({ item }: { item: StatusItem["comment"][number] }) => {
        const mine = isMine(item.createdBy, myEmail);
        const av = getAvatarInfo(item.createdBy);

        return (
        <View style={styles.cShadow}>
            <View style={[styles.cItem, { backgroundColor: color.surface }]}>
            <View style={styles.cHeader}>
                <View style={styles.cHeaderLeft}>
                {av.type === "image" ? (
                    <Image source={av.src} style={styles.cAvatar} />
                ) : (
                    <View
                    style={[
                        styles.cAvatar,
                        styles.avatarFallback,
                        { backgroundColor: isDarkMode ? "#2d2d2d" : "#4a90e2" },
                    ]}
                    >
                    <Text style={styles.avatarText}>{av.text}</Text>
                    </View>
                )}

                <View>
                    <Text style={[styles.cName, { color: color.text }]}>
                    {displayName(item.createdBy)}
                    </Text>
                    <Text style={[styles.cTime, { color: color.textSecondary }]}>
                    {timeAgo(item.createdAt)}
                    </Text>
                </View>
                </View>

                {mine && (
                <TouchableOpacity onPress={() => onDeleteComment(item._id)}>
                    <Text style={{ color: "#e74c3c", fontWeight: "800" }}>ลบ</Text>
                </TouchableOpacity>
                )}
            </View>

            <Text style={{ color: color.text }}>{item.content}</Text>
            </View>
        </View>
        );
    };

    return (
        <View style={[styles.screen, { backgroundColor: color.background }]}>
        <FlatList
            data={post.comment}
            keyExtractor={(c) => c._id}
            ListHeaderComponent={ListHeader}
            renderItem={renderComment}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            contentContainerStyle={{ paddingVertical: 10, paddingBottom: 18 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
        />

        {/* composer */}
        <View style={styles.composerShadow}>
            <View style={[styles.inputRow, { backgroundColor: color.surface }]}>
            <TextInput
                placeholder="พิมพ์คอมเมนต์..."
                placeholderTextColor={color.textSecondary}
                style={[styles.input, { color: color.text }]}
                value={text}
                onChangeText={setText}
                multiline
            />
            <TouchableOpacity
                onPress={onAdd}
                disabled={!text.trim() || adding}
                style={[
                styles.sendBtn,
                { backgroundColor: !text.trim() || adding ? "#9bb8ff" : color.primary },
                ]}
            >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                {adding ? "..." : "ส่ง"}
                </Text>
            </TouchableOpacity>
            </View>
        </View>
        </View>
    );
}

const AVA = 40;

const styles = StyleSheet.create({
    screen: { flex: 1, paddingHorizontal: 14 },

    /* post card */
    cardShadow: {
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
        marginBottom: 6,
        paddingHorizontal: 0,
    },
    card: {
        borderRadius: 14,
        padding: 14,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 8,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flexShrink: 1,
    },
    avatar: { width: AVA, height: AVA, borderRadius: AVA / 2 },
    avatarFallback: { alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontWeight: "800", fontSize: 12, letterSpacing: 0.4 },
    author: { fontWeight: "800", fontSize: 16 },
    time: { fontSize: 12, marginTop: 2 },
    postText: { lineHeight: 22, marginTop: 4, marginBottom: 10, fontSize: 15 },
    metaRow: { flexDirection: "row", gap: 16 },

    /* comment items */
    cShadow: {
        borderRadius: 12,
        paddingHorizontal: 0,
        ...Platform.select({
        ios: {
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
        },
        android: { elevation: 2 },
        }),
    },
    cItem: { padding: 12, borderRadius: 12 },
    cHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    cHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    cAvatar: { width: 34, height: 34, borderRadius: 17 },
    cName: { fontWeight: "800" },
    cTime: { fontSize: 11, marginTop: 2 },

    /* composer */
    composerShadow: {
        paddingTop: 6,
        paddingBottom: 10,
        ...Platform.select({
        ios: {
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: -2 },
        },
        android: { elevation: 8 },
        }),
        backgroundColor: "transparent",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        borderRadius: 14,
        padding: 10,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: "rgba(127,127,127,0.06)",
    },
    sendBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignSelf: "flex-end",
    },
});
