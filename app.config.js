import 'dotenv/config';

export default {
    expo: {
        name: "Local-authentication-Section7",
        slug: "Local-authentication-Section7",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.localauthentication.section7",
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            package: "com.localauthentication.section7",
            edgeToEdgeEnabled: true
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        scheme: "local-authentication",
        plugins: ["expo-router"],
        extra: {
            apiUrl: process.env.REACT_APP_NATIVE_API_URL,
        },
    },
};