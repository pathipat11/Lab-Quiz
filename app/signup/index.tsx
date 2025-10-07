import { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import Constants from "expo-constants";

const Signup = () => {
  const { color } = useTheme();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();
  const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";

  const handleSignup = async () => {
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      let result: any;
      try {
        result = await response.json();
      } catch {
        result = { error: await response.text() };
      }

      if (response.ok) {
        Alert.alert("Success", "Account created!", [
          { text: "OK", onPress: () => router.push("/signin") },
        ]);
      } else {
        let errorMsg = "Signup failed";
        if (result.errors && Array.isArray(result.errors)) {
          errorMsg = result.errors.map((e: any) => e.msg).join("\n");
        } else if (result.message || result.error) {
          errorMsg = result.message || result.error;
        }
        console.log("Signup failed:", errorMsg);
        Alert.alert("Error", errorMsg);
      }
    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert("Network Error", "Unable to connect to the server.");
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: color.background }]}>
      <View style={[styles.container, { backgroundColor: color.surface }]}>
        <Text style={[styles.header, { color: color.text }]}>Create Account</Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor={color.textSecondary}
          style={[styles.input, { color: color.text, borderColor: color.textSecondary }]}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={color.textSecondary}
          keyboardType="email-address"
          style={[styles.input, { color: color.text, borderColor: color.textSecondary }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={color.textSecondary}
          secureTextEntry
          style={[styles.input, { color: color.text, borderColor: color.textSecondary }]}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: color.primary }]}
          onPress={handleSignup}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  container: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
