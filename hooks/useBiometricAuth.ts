import { useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { Alert } from "react-native";

export const useBiometricAuth = () => {
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        (async () => {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            setIsBiometricSupported(hasHardware);
            if (!hasHardware) {
                Alert.alert("Error", "Biometric authentication is not supported.");
                return;
            }

            const enrolled = await LocalAuthentication.isEnrolledAsync();
            setIsEnrolled(enrolled);
            if (!enrolled) {
                Alert.alert("Error", "No biometric records found on this device.");
            }
        })();
    }, []);

    const authenticate = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Authenticate",
                fallbackLabel: "Enter Passcode",
                disableDeviceFallback: false,
            });
            return result.success;
        } catch {
            Alert.alert("Error", "Authentication error.");
            return false;
        }
    };

    return { isBiometricSupported, isEnrolled, authenticate };
};