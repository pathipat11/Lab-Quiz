import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useBiometricAuth } from "./hooks/useBiometricAuth";

export default function App() {
  const [isLogin, setIsLogin] = useState(false);
  const { isBiometricSupported, isEnrolled, authenticate } = useBiometricAuth();

  const handleLogin = async () => {
    if (isBiometricSupported && isEnrolled && !isLogin) {
      const success = await authenticate();
      if (success) setIsLogin(true);
    }
  };

  const handleLogout = () => setIsLogin(false);

  return (
    <View style={styles.container}>
      {isLogin ? (
        <>
          <Text>✅ Welcome, you are logged in to Application.</Text>
          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <>
          <Text>🔐 Please login to Application.</Text>
          <Button title="Login" onPress={handleLogin} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
