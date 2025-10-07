import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, TouchableOpacity, Text, StyleSheet, Modal, Pressable, Animated, Platform, LayoutChangeEvent
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { getProfile } from "../../services/authService";
import { useTheme } from "../../context/ThemeContext";

const getInitialFromUser = (u: any) => {
  const name =
    u?.username ||
    [u?.firstname, u?.lastname].filter(Boolean).join(" ").trim() ||
    u?.email ||
    "";
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : null;
};

const AuthToggle: React.FC = () => {
  const { color, isDarkMode } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isSignin = pathname.includes("signin");

  const [usernameInitial, setUsernameInitial] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  // สำหรับวัดตำแหน่ง avatar เพื่อวางเมนูให้ชิดปุ่ม
  const avatarRef = useRef<View | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 20, y: 50 });

  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();

  async function loadUserInitial() {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const parsed = JSON.parse(userStr);
        const init = getInitialFromUser(parsed);
        if (init) { setUsernameInitial(init); return; }
      }
      const profile = await getProfile();
      await AsyncStorage.setItem("user", JSON.stringify(profile));
      const init = getInitialFromUser(profile);
      setUsernameInitial(init);
    } catch {
      setUsernameInitial(null);
    }
  }

  useEffect(() => { loadUserInitial(); }, []);
  useFocusEffect(useCallback(() => { loadUserInitial(); }, []));

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("user");
    setShowMenu(false);
    setUsernameInitial(null);
    router.replace("/signin");
  };

  const handlePress = () => {
    if (usernameInitial) {
      // คำนวณตำแหน่ง anchor ของเมนู
      avatarRef.current?.measureInWindow((x, y) => setMenuPos({ x, y: y + 44 }));
      setShowMenu(true);
    } else {
      router.push(isSignin ? "/signup" : "/signin");
    }
  };

  const onAvatarLayout = (e: LayoutChangeEvent) => {
    // กันกรณีแรกเข้า
    avatarRef.current?.measureInWindow((x, y) => setMenuPos({ x, y: y + 44 }));
  };

  return (
    <>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          ref={avatarRef as any}
          onLayout={onAvatarLayout}
          activeOpacity={0.9}
          onPressIn={pressIn}
          onPressOut={pressOut}
          onPress={handlePress}
        >
          {usernameInitial ? (
            <View style={[styles.avatarWrap, isDarkMode ? styles.glassDark : styles.glassLight]}>
              <View style={[styles.avatarCircle, { backgroundColor: color.primary }]}>
                <Text style={styles.avatarText}>{usernameInitial}</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.button, { backgroundColor: color.primary }]}>
              <Text style={styles.buttonText}>{isSignin ? "Sign Up" : "Sign In"}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Modal transparent animationType="fade" visible={showMenu} onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          {/* กล่องเมนู */}
          <View
            style={[
              styles.menu,
              {
                left: Math.max(12, menuPos.x - 8),
                top: menuPos.y,
                backgroundColor: isDarkMode ? "#121212" : "#fff",
                shadowColor: "#000",
              },
            ]}
          >
            {/* caret สามเหลี่ยม */}
            <View
              style={[
                styles.caret,
                {
                  borderBottomColor: isDarkMode ? "#121212" : "#fff",
                },
              ]}
            />

            <Pressable
              android_ripple={{ color: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
              style={styles.menuItemBtn}
              onPress={() => {
                setShowMenu(false);
                router.push("/profile");
              }}
            >
              <Text style={[styles.menuItem, { color: isDarkMode ? "#fff" : "#111" }]}>View Profile</Text>
            </Pressable>

            <Pressable
              android_ripple={{ color: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
              style={styles.menuItemBtn}
              onPress={handleLogout}
            >
              <Text style={[styles.menuItem, { color: isDarkMode ? "#fff" : "#111" }]}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default AuthToggle;

const styles = StyleSheet.create({
  // ปุ่ม sign-in/up
  button: {
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 3 },
    }),
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 12, letterSpacing: 0.3 },

  // อวตารตัวอักษร
  avatarWrap: {
    marginLeft: 5,
    borderRadius: 22,
    padding: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 4 },
    }),
  },
  glassLight: { backgroundColor: "rgba(255,255,255,0.6)" },
  glassDark: { backgroundColor: "rgba(255,255,255,0.08)" },

  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  // เมนู popover
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.18)" },
  menu: {
    position: "absolute",
    minWidth: 160,
    borderRadius: 12,
    paddingVertical: 6,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 8 },
    }),
  },
  caret: {
    position: "absolute",
    top: -5,
    left: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  menuItemBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  menuItem: { fontSize: 14, fontWeight: "600" },
});
