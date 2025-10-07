import 'dotenv/config';

export default {
    expo: {
        name: "Lab-Quiz",
        slug: "Lab-Quiz",
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
            bundleIdentifier: "com.labquiz",
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            package: "com.labquiz",
            edgeToEdgeEnabled: true
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        scheme: "local-authentication",
        plugins: ["expo-router"],
        extra: {
            // apiUrl: process.env.REACT_APP_NATIVE_API_URL,
            apiUrl: "https://cis.kku.ac.th/api/classroom",

            apiKey: "b2dd3c67b3302c0a71f374bf9954ec0130d333923647da9ccb770ca545cc9202"
        },
    },
};