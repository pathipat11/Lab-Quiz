import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, Pressable } from "react-native";
import { listPosts, createPost, toggleLike, Post } from "../../services/feedService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function Feed() {
    const { color } = useTheme();
    const [posts, setPosts] = useState<Post[]>([]);
    const [text, setText] = useState("");
    const [username, setUsername] = useState<string>("");

    useEffect(() => { (async () => {
        const u = await AsyncStorage.getItem("user");
        setUsername(u ? (JSON.parse(u).username ?? "user") : "user");
        setPosts(await listPosts());
    })(); }, []);

    async function onCreate() {
        if (!text.trim()) return;
        await createPost(username, text.trim());
        setText(""); setPosts(await listPosts());
    }
    async function onLike(id: string) {
        await toggleLike(id, username);
        setPosts(await listPosts());
    }

    return (
        <View style={{ flex:1, padding:16, width:"100%", maxWidth:700, alignSelf:"center", gap:12 }}>
        <Text style={{ fontSize:22, fontWeight:"700", color: color.text }}>สถานะล่าสุด</Text>

        <View style={{ gap:8 }}>
            <TextInput
            placeholder="เขียนสิ่งที่อยากบอก..."
            placeholderTextColor={color.textSecondary}
            style={{ borderWidth:1, borderColor:"#ddd", padding:12, borderRadius:12, minHeight:44, color: color.text }}
            value={text} onChangeText={setText} multiline
            />
            <Button title="โพสต์" onPress={onCreate} />
        </View>

        <FlatList
            data={posts}
            keyExtractor={(p) => p.id}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
            <View style={{ borderWidth:1, borderColor:"#eee", borderRadius:12, padding:12, backgroundColor: color.surface, gap:8 }}>
                <Text style={{ fontWeight:"700", color: color.text }}>{item.user}</Text>
                <Text style={{ color: color.text }}>{item.content}</Text>
                <View style={{ flexDirection:"row", gap:12, alignItems:"center" }}>
                <Pressable onPress={() => onLike(item.id)}><Text style={{ color: color.text }}>👍 {item.likes.length}</Text></Pressable>
                <Link href={`/feed/${item.id}`} style={{ color: color.primary }}>ดูคอมเมนต์ ({item.comments.length})</Link>
                </View>
            </View>
            )}
        />
        </View>
    );
}
