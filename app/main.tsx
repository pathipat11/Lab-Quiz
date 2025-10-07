import React, { useRef } from "react";
import {
    StyleSheet,
    Image,
    Text,
    View,
    TouchableOpacity,
    Linking,
    ScrollView,
    Animated,
    TouchableWithoutFeedback,
} from "react-native";
import { Link } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTheme } from "../context/ThemeContext";

type AnimatedCardProps = {
    children: React.ReactNode;
    color: {
        surface: string;
        primary?: string;
        text?: string;
        textSecondary?: string;
        buttonAbout?: string;
        buttonBooks?: string;
        background?: string;
    };
};

// 🌀 Card with animated scale
const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, color }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
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

const Home: React.FC = () => {
    const { color } = useTheme();

    const contactLinks: {
        icon: string;
        color: string;
        label: string;
        value: string;
        link: string;
    }[] = [
        {
            icon: "facebook-square",
            color: "#4267B2",
            label: "Facebook",
            value: "Pathipat Mattra",
            link: "https://facebook.com/pathipat.mattra",
        },
        {
            icon: "github",
            color: "#000",
            label: "GitHub",
            value: "pathipat11",
            link: "https://github.com/pathipat11",
        },
        {
            icon: "linkedin-square",
            color: "#0077B5",
            label: "LinkedIn",
            value: "Pathipat Mattra",
            link: "https://linkedin.com/in/viixl",
        },
    ];

    return (
        <ScrollView style={{ backgroundColor: color.background }}>
            <View style={styles.container}>
                {/* Profile */}
                <View style={styles.profileBox}>
                    <Image
                        source={require("../assets/image/profile.jpg")}
                        style={styles.profile}
                    />
                    <Text style={[styles.name, { color: color.text }]}>
                        Pathipat Mattra
                    </Text>
                    <Text style={[styles.sub, { color: color.textSecondary }]}>
                        Student Number: 65345293-2
                    </Text>
                </View>

                {/* Education */}
                <AnimatedCard color={color}>
                    <Text style={[styles.cardTitle, { color: color.primary }]}>
                        Education
                    </Text>
                    <Text style={[styles.text, { color: color.textSecondary }]}>
                        📚 Khon Kaen University
                    </Text>
                    <Text style={[styles.text, { color: color.textSecondary }]}>
                        📘 Major: Computer Science
                    </Text>
                    <Text style={[styles.text, { color: color.textSecondary }]}>
                        🧾 Bachelor of Science in Computer Science
                    </Text>
                </AnimatedCard>

                {/* Interests */}
                <AnimatedCard color={color}>
                    <Text style={[styles.cardTitle, { color: color.primary }]}>
                        Interests
                    </Text>
                    <Text style={[styles.text, { color: color.textSecondary }]}>
                        🔧 Web Application Development (Full-Stack / Back-end)
                    </Text>
                    <Text style={[styles.text, { color: color.textSecondary }]}>
                        💻 Aspiring Software Engineer
                    </Text>
                </AnimatedCard>

                {/* Contact */}
                <AnimatedCard color={color}>
                    <Text style={[styles.cardTitle, { color: color.primary }]}>
                        Contact
                    </Text>
                    {contactLinks.map((item, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.contactCard}
                            onPress={() => Linking.openURL(item.link)}
                            activeOpacity={0.7}
                        >
                            <Icon
                                name={item.icon}
                                size={22}
                                color={item.color}
                                style={{ marginRight: 12 }}
                            />
                            <View>
                                <Text
                                    style={[
                                        styles.contactLabel,
                                        { color: color.text },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                                <Text
                                    style={[
                                        styles.contactValue,
                                        { color: color.textSecondary },
                                    ]}
                                >
                                    {item.value}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </AnimatedCard>

                {/* About link */}
                <Link
                    href="/about"
                    style={[
                        styles.button,
                        { backgroundColor: color.buttonAbout },
                    ]}
                >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                        About the Course
                    </Text>
                </Link>

                <Link
                    href={"/book"}
                    style={[
                        styles.button,
                        { backgroundColor: color.buttonBooks },
                    ]}
                >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                        Book Collection
                    </Text>
                </Link>
            </View>
        </ScrollView>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 40,
    },
    profileBox: {
        alignItems: "center",
        marginBottom: 24,
    },
    profile: {
        height: 128,
        width: 128,
        borderRadius: 64,
        borderWidth: 3,
        borderColor: "#4a90e2",
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: "700",
    },
    sub: {
        fontSize: 14,
        marginTop: 2,
    },
    card: {
        padding: 16,
        borderRadius: 14,
        marginBottom: 18,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    text: {
        fontSize: 14,
        marginBottom: 4,
    },
    contactCard: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },
    contactLabel: {
        fontSize: 14,
        fontWeight: "600",
    },
    contactValue: {
        fontSize: 13,
    },
    button: {
        marginTop: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        textAlign: "center",
    },
});
