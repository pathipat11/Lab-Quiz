import React, { useMemo, useRef } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Animated,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, usePathname } from "expo-router";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from "../../context/ThemeContext";

type Item = {
    key: string;
    href: string;
    render: (active: boolean, tint: string, dim: string) => React.ReactNode;
};

const HIT = { top: 10, bottom: 10, left: 10, right: 10 };

const BottomBar: React.FC<{ avatar?: any; showDotOnProfile?: boolean }> = ({
    avatar,
    showDotOnProfile,
}) => {
    const { color, isDarkMode } = useTheme();
    const pathname = usePathname();

    const items: Item[] = [
        {
        key: "home",
        href: "/main",
        render: (a, tint, dim) => (
            <MaterialCommunityIcons
            name={a ? "home-variant" : "home-variant-outline"}
            size={26}
            color={a ? tint : dim}
            />
        )
        },
        {
        key: "class",
        href: "/class/2565",
        render: (a, tint, dim) => (
            <MaterialCommunityIcons
            name={a ? "compass" : "compass-outline"}
            size={25}
            color={a ? tint : dim}
            />
        ),
        },
        {
        key: "add",
        href: "/feed", // เปลี่ยนเป็นหน้าสร้างโพสต์ของคุณได้
        render: (a, tint, dim) => (
            <View style={[styles.plusRing, { borderColor: a ? tint : dim }]}>
            <MaterialCommunityIcons
                name="plus"
                size={18}
                color={a ? tint : dim}
            />
            </View>
        ),
        },
        {
        key: "setting",
        href: "/setting",
        render: (a, tint, dim) => (
            <MaterialCommunityIcons
            name={a ? "cog" : "cog-outline"}
            size={25}
            color={a ? tint : dim}
            />
        ),
        },
    ];

    const tint = color.primary;              // สี active
    const dim = isDarkMode ? "#BDBDBD" : "#888"; // สี inactive

    return (
        <SafeAreaView
        style={[
            styles.safe,
            {
            backgroundColor: isDarkMode ? "#000" : "#fff",
            borderTopColor: color.border ?? (isDarkMode ? "#1f1f1f" : "#e0e0e0"),
            },
        ]}
        pointerEvents="box-none"
        >
        <View style={styles.wrap}>
            {items.map((it) => {
            const active = pathname?.startsWith(it.href);
            const scale = useRef(new Animated.Value(active ? 1.06 : 1)).current;
            const onPressIn = () =>
                Animated.spring(scale, {
                toValue: 0.92,
                useNativeDriver: true,
                }).start();
            const onPressOut = () =>
                Animated.spring(scale, {
                toValue: active ? 1.06 : 1,
                useNativeDriver: true,
                }).start();

            return (
                <Link key={it.key} href={it.href} asChild>
                <TouchableOpacity
                    hitSlop={HIT}
                    activeOpacity={0.85}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    style={styles.item}
                    accessibilityRole="button"
                >
                    <Animated.View style={{ transform: [{ scale }] }}>
                    {it.render(active, tint, dim)}
                    </Animated.View>
                    {active && (
                    <View style={[styles.dot, { backgroundColor: tint }]} />
                    )}
                </TouchableOpacity>
                </Link>
            );
            })}

            {/* โปรไฟล์ขวาสุดแบบ IG */}
            <Link href="/profile" asChild>
            <TouchableOpacity hitSlop={HIT} activeOpacity={0.85} style={styles.item}>
                <View>
                <Image
                    source={avatar || require("../../assets/image/profile.jpg")}
                    style={[
                    styles.avatar,
                    {
                        borderColor: isDarkMode ? "#fff" : "#000",
                        opacity: 1,
                    },
                    ]}
                />
                {showDotOnProfile && (
                    <View style={styles.notifyDot} />
                )}
                </View>
            </TouchableOpacity>
            </Link>
        </View>
        </SafeAreaView>
    );
};

export default BottomBar;

const styles = StyleSheet.create({
    safe: {
        borderTopWidth: StyleSheet.hairlineWidth,
        // shadow (Android/iOS)
        ...Platform.select({
        ios: {
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 8,
        },
        android: { elevation: 14 },
        }),
    },
    wrap: {
        height: 62,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 6,
    },
    item: {
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingHorizontal: 6,
        minWidth: 54,
    },
    dot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.5,
    },
    notifyDot: {
        position: "absolute",
        right: -2,
        top: -2,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: "#ff3b30",
        borderWidth: 1,
        borderColor: "#000",
    },
    plusRing: {
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1.6,
        alignItems: "center",
        justifyContent: "center",
    },
});