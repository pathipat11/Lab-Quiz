import React, { useMemo, useRef, useEffect } from "react";
import { TouchableOpacity, StyleSheet, View, Animated } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";

const WIDTH = 62;
const HEIGHT = 30;
const KNOB = 24;

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme, color } = useTheme();
  const x = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(x, {
      toValue: isDarkMode ? 1 : 0,
      useNativeDriver: false,
      friction: 7,
      tension: 120,
    }).start();
  }, [isDarkMode]);

  const knobLeft = x.interpolate({
    inputRange: [0, 1],
    outputRange: [3, WIDTH - KNOB - 3],
  });

  const grad = useMemo<[string, string]>(
    () => (isDarkMode ? ["#1d1d1f", "#0f0f10"] : ["#ffb86c", "#ff708e"]),
    [isDarkMode]
  );

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={toggleTheme}>
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.wrap}>
        <View style={[styles.track, { borderColor: isDarkMode ? "#2a2a2d" : "#ffffff55" }]}>
          <Animated.View
            style={[
              styles.knob,
              {
                left: knobLeft,
                backgroundColor: color.surface,
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
              },
            ]}
          />
          <View style={styles.iconLeft}>
            <Feather name="sun" size={14} color={"#fff"} />
          </View>
          <View style={styles.iconRight}>
            <Feather name="moon" size={14} color={"#fff"} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default ThemeToggle;

const styles = StyleSheet.create({
  wrap: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    padding: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  track: {
    flex: 1,
    borderRadius: HEIGHT / 2,
    overflow: "hidden",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  knob: {
    position: "absolute",
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
  },
  iconLeft: { position: "absolute", left: 8 },
  iconRight: { position: "absolute", right: 8 },
});
