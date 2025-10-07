import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ColorScheme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  error: string;
  border: string;
  buttonAbout: string;
  buttonBooks: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  color: ColorScheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // โหลดธีมล่าสุดจาก AsyncStorage (จำโหมดไว้)
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("themeMode");
      if (saved === "dark") setIsDarkMode(true);
    })();
  }, []);

  const toggleTheme = async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    await AsyncStorage.setItem("themeMode", next ? "dark" : "light");
  };

  // 🎨 โทนสีใหม่แบบ Instagram
  const color: ColorScheme = isDarkMode
    ? {
        background: "#000000",
        surface: "#121212",
        text: "#ffffff",
        textSecondary: "#a8a8a8",
        primary: "#ff4081", // accent แบบ IG
        secondary: "#03dac6",
        error: "#cf6679",
        border: "#222",
        buttonAbout: "#ff4081",
        buttonBooks: "#03dac6",
      }
    : {
        background: "#fafafa",
        surface: "#ffffff",
        text: "#000000",
        textSecondary: "#666666",
        primary: "#405de6", // IG blue
        secondary: "#5851db",
        error: "#d32f2f",
        border: "#e0e0e0",
        buttonAbout: "#405de6",
        buttonBooks: "#28a745",
      };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, color }}>
      {children}
    </ThemeContext.Provider>
  );
};
