import 'dotenv/config';
// console.log('CONFIG apiUrl:', process.env.REACT_APP_NATIVE_API_URL);
// console.log('CONFIG apiKey:', process.env.REACT_APP_NATIVE_API_KEY);
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

            apiKey: process.env.REACT_APP_NATIVE_API_KEY 

        },
    },
};