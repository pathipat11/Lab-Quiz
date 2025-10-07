import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import { getPost, addComment, Post } from "../../services/feedService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

export default function PostDetail() {
    const { color } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [post, setPost] = useState<Post | undefined>();
    const [text, setText] = useState("");
    const [username, setUsername] = useState<string>("");

    useEffect(() => { (async () => {
        setPost(await getPost(id));
        const u = await AsyncStorage.getItem("user");
        setUsername(u ? (JSON.parse(u).username ?? "user") : "user");
    })(); }, [id]);

    async function onAdd() {
        if (!text.trim()) return;
        await addComment(id, username, text.trim());
        setText(""); setPost(await getPost(id));
    }

    if (!post) return null;

    return (
        <View style={{ flex:1, padding:16, width:"100%", maxWidth:700, alignSelf:"center", gap:12 }}>
        <View style={{ borderWidth:1, borderColor:"#eee", borderRadius:12, padding:12, backgroundColor: color.surface }}>
            <Text style={{ fontWeight:"700", color: color.text }}>{post.user}</Text>
            <Text style={{ color: color.text }}>{post.content}</Text>
        </View>

        <Text style={{ fontSize:18, fontWeight:"700", color: color.text }}>คอมเมนต์</Text>
        <FlatList
            data={post.comments}
            keyExtractor={(c) => c.id}
            ItemSeparatorComponent={() => <View style={{ height:8 }} />}
            renderItem={({ item }) => (
            <View style={{ borderWidth:1, borderColor:"#eee", borderRadius:12, padding:10, backgroundColor: color.surface }}>
                <Text style={{ fontWeight:"600", color: color.text }}>{item.user}</Text>
                <Text style={{ color: color.text }}>{item.text}</Text>
            </View>
            )}
        />

        <View style={{ gap:8 }}>
            <TextInput
            placeholder="พิมพ์คอมเมนต์..."
            placeholderTextColor={color.textSecondary}
            style={{ borderWidth:1, borderColor:"#ddd", padding:12, borderRadius:12, color: color.text }}
            value={text} onChangeText={setText}
            />
            <Button title="ส่งคอมเมนต์" onPress={onAdd} />
        </View>
        </View>
    );
}
