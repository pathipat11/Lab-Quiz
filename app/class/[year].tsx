import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getMembersByYear, ClassMember } from "../../services/classService";
import { useTheme } from "../../context/ThemeContext";

export default function ClassYearScreen() {
    const { color } = useTheme();
    const { year } = useLocalSearchParams<{ year: string }>();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<ClassMember[]>([]);

    useEffect(() => {
        (async () => {
        try { const data = await getMembersByYear(year!); setMembers(data); }
        finally { setLoading(false); }
        })();
    }, [year]);

    if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={color.primary} />;

    return (
        <View style={{ flex:1, padding:16, width:"100%", maxWidth:900, alignSelf:"center" }}>
        <Text style={{ fontSize:22, fontWeight:"700", color: color.text, marginBottom:12 }}>
            รายชื่อนักศึกษา ชั้นปี {year}
        </Text>
        <FlatList
            data={members}
            keyExtractor={(m) => m._id}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
            <View style={{ padding:12, borderWidth:1, borderColor:"#eee", borderRadius:12, backgroundColor: color.surface }}>
                <Text style={{ fontWeight:"700", color: color.text }}>
                {item.firstname} {item.lastname}
                </Text>
                {!!item.education?.studentId && (
                <Text style={{ color: color.textSecondary }}>รหัส: {item.education.studentId}</Text>
                )}
                {!!item.email && <Text style={{ color: color.textSecondary }}>{item.email}</Text>}
            </View>
            )}
        />
        </View>
    );
}
