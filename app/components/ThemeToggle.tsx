import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme, color } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
      <View style={[styles.toggleBox, { backgroundColor: color.surface }]}>
        <Text style={[styles.toggleText, { color: color.text }]}>
          {isDarkMode ? "Dark" : "Light"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ThemeToggle;

const styles = StyleSheet.create({
  toggleBox: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleText: {
    fontWeight: "600",
    fontSize: 8,
  },
});
