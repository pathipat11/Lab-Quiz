import { useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { addComment, getStatusById, StatusItem, displayName } from "../../services/statusService";
import { useTheme } from "../../context/ThemeContext";

export default function PostDetail() {
    const { color } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [post, setPost] = useState<StatusItem | null>(null);
    const [text, setText] = useState("");

    const load = useCallback(async () => {
        if (!id) return;
        const data = await getStatusById(id);
        setPost(data);
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const onAdd = async () => {
        if (!text.trim()) return;
        await addComment(id!, text.trim());
        setText("");
        await load();
    };

    if (!post) return null;

    return (
        <View style={[styles.screen, { backgroundColor: color.background }]}>
        <View style={[styles.card, { backgroundColor: color.surface }]}>
            <Text style={[styles.title, { color: color.text }]}>
            {displayName(post.createdBy)}
            </Text>
            <Text style={{ color: color.text }}>{post.content}</Text>
        </View>

        <Text style={[styles.h2, { color: color.text }]}>คอมเมนต์</Text>
        <FlatList
            data={post.comment}
            keyExtractor={(c) => c._id}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
            <View style={[styles.cItem, { backgroundColor: color.surface }]}>
                <Text style={[styles.cName, { color: color.text }]}>
                {displayName(item.createdBy)}
                </Text>
                <Text style={{ color: color.text }}>{item.content}</Text>
                <Text style={{ color: color.textSecondary, fontSize: 12 }}>
                {new Date(item.createdAt).toLocaleString()}
                </Text>
            </View>
            )}
        />

        <View style={{ gap: 8, marginTop: 10 }}>
            <TextInput
            placeholder="พิมพ์คอมเมนต์..."
            placeholderTextColor={color.textSecondary}
            style={[styles.input, { color: color.text, borderColor: "#eaeaea" }]}
            value={text}
            onChangeText={setText}
            />
            <TouchableOpacity onPress={onAdd} style={[styles.sendBtn, { backgroundColor: color.primary }]}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>ส่งคอมเมนต์</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, padding: 14 },
    card: { padding: 12, borderRadius: 12, marginBottom: 10 },
    title: { fontWeight: "700", marginBottom: 6 },
    h2: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
    cItem: { padding: 10, borderRadius: 10 },
    cName: { fontWeight: "600", marginBottom: 2 },
    input: { borderWidth: 1, borderRadius: 10, padding: 10 },
    sendBtn: { alignSelf: "flex-start", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
});