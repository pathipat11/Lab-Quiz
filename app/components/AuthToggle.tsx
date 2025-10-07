import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthToggle: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isSignin = pathname.includes("signin");

  const [usernameInitial, setUsernameInitial] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        try {
          const parsed: { username?: string } = JSON.parse(userData);
          if (parsed?.username) {
            setUsernameInitial(parsed.username.charAt(0).toUpperCase());
          }
        } catch (e) {
          console.error("Failed to parse user from storage");
        }
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("user");
    setShowMenu(false);
    router.replace("/signin");
  };

  const handlePress = () => {
    if (usernameInitial) {
      setShowMenu(true);
    } else {
      router.push(isSignin ? "/signup" : "/signin");
    }
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress}>
        {usernameInitial ? (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{usernameInitial}</Text>
          </View>
        ) : (
          <View style={styles.button}>
            <Text style={styles.buttonText}>{isSignin ? "Sign Up" : "Sign In"}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal menu */}
      <Modal
        transparent
        animationType="fade"
        visible={showMenu}
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menu}>
            <Pressable
              onPress={() => {
                setShowMenu(false);
                router.push("/profile");
              }}
            >
              <Text style={styles.menuItem}>View Profile</Text>
            </Pressable>
            <Pressable onPress={handleLogout}>
              <Text style={styles.menuItem}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default AuthToggle;

const styles = StyleSheet.create({
  button: {
    marginLeft: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#4a90e2",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  avatar: {
    marginLeft: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  menu: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuItem: {
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "500",
  },
});
