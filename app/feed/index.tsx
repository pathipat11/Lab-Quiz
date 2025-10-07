import { useEffect, useState, useCallback } from "react";
import {
    View, Text, TextInput, FlatList, RefreshControl,
    TouchableOpacity, Image, StyleSheet, Alert
    } from "react-native";
import {
    listStatuses, createStatus, likeStatus, unlikeStatus,
    StatusItem, displayName, isMine, deleteStatus
} from "../../services/statusService";
import { useTheme } from "../../context/ThemeContext";
import { Link } from "expo-router";
import { getProfile } from "../../services/authService";

export default function Feed() {
    const { color } = useTheme();
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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }, [load]);

    const onSubmit = async () => {
        if (!content.trim() || submitting) return;
        setSubmitting(true);
        await createStatus(content.trim());
        setContent("");
        await load();
        setSubmitting(false);
    };

    const onToggleLike = async (p: StatusItem) => {
        try {
        if (p.hasLiked) await unlikeStatus(p._id);
        else await likeStatus(p._id);
        await load();
        } catch (e: any) {
        Alert.alert("ไม่สามารถกดถูกใจ", e?.message ?? "เกิดข้อผิดพลาด");
        }
    };

    const onDeletePost = async (id: string) => {
        Alert.alert("ลบโพสต์", "ต้องการลบโพสต์นี้หรือไม่?", [
            { text: "ยกเลิก", style: "cancel" },
            { text: "ลบ", style: "destructive", onPress: async () => {
                try {
                await deleteStatus(id);
                await load();
                } catch (e: any) {
                Alert.alert("ลบโพสต์ไม่สำเร็จ", e?.message ?? "เกิดข้อผิดพลาด (500)");
                }
            }}
        ]);
    };


    const renderItem = ({ item }: { item: StatusItem }) => {
        const avatarSource = require("../../assets/image/profile.jpg");
        const likeCount = (typeof item.likeCount === "number")
        ? item.likeCount
        : (item.like?.length ?? 0);

        return (
        <View style={[styles.card, { backgroundColor: color.surface, borderColor: "#eaeaea" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={avatarSource} style={styles.avatar} />
                <View>
                <Text style={[styles.email, { color: color.primary }]}>
                    {displayName(item.createdBy)}
                </Text>
                <Text style={[styles.time, { color: color.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleString()}
                </Text>
                </View>
            </View>

            {isMine(item.createdBy, myEmail) && (
                <TouchableOpacity onPress={() => onDeletePost(item._id)}>
                <Text style={{ color: "#e74c3c", fontWeight: "700" }}>ลบโพสต์</Text>
                </TouchableOpacity>
            )}
            </View>

            <Text style={{ color: color.text, marginBottom: 8 }}>{item.content}</Text>

            <View style={styles.toolbar}>
            <TouchableOpacity onPress={() => onToggleLike(item)}>
                <Text style={[styles.action, { color: color.text }]}>
                {item.hasLiked ? "💙" : "👍"} {likeCount}
                </Text>
            </TouchableOpacity>
            <Link href={`/feed/${item._id}`} style={[styles.action, { color: color.primary }]}>
                💬 {item.comment?.length ?? 0}
            </Link>
            </View>
        </View>
        );
    };

    return (
        <View style={[styles.screen, { backgroundColor: color.background }]}>
        <View style={[styles.composer, { backgroundColor: color.surface }]}>
            <View style={[styles.headerBox, { backgroundColor: color.surface }]}>
            <Text style={[styles.headerTitle, { color: color.text, fontWeight: "700" }]}>📢 โพสต์สถานะ</Text>
            </View>
            <TextInput
            placeholder="คุณกำลังคิดอะไรอยู่..."
            placeholderTextColor={color.textSecondary}
            value={content}
            onChangeText={setContent}
            style={[styles.input, { color: color.text, borderColor: "#eaeaea" }]}
            multiline
            />
            <TouchableOpacity
            disabled={submitting}
            onPress={onSubmit}
            style={[styles.postBtn, { backgroundColor: "#49d488", opacity: submitting ? 0.6 : 1 }]}
            >
            <Text style={{ color: "#fff", fontWeight: "700" }}>โพสต์</Text>
            </TouchableOpacity>
        </View>

        <FlatList
            data={posts}
            keyExtractor={(i) => i._id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingVertical: 8 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, padding: 14 },
    headerBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, borderRadius: 12, marginBottom: 8 },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    composer: { padding: 12, borderRadius: 12, marginBottom: 8, gap: 8 },
    input: { borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 40 },
    postBtn: { alignSelf: "flex-start", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
    card: { borderWidth: 1, borderRadius: 12, padding: 12 },
    avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
    email: { fontWeight: "700" },
    time: { fontSize: 12 },
    toolbar: { flexDirection: "row", gap: 16, marginTop: 4 },
    action: { fontWeight: "600" },
});