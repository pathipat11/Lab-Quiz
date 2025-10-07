import React, { createContext, useContext, useState, ReactNode } from "react";

// Define types
interface ColorScheme {
  background: string;
  text: string;
  textSecondary: string;
  surface: string;
  primary: string;
  secoundary: string;
  error: string;
  buttonAbout: string;
  buttonBooks: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  color: ColorScheme;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// Create context with default undefined
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const color: ColorScheme = {
    background: isDarkMode ? "#000" : "#fff",
    text: isDarkMode ? "#fff" : "#000",
    textSecondary: isDarkMode ? "#ccc" : "#333",
    surface: isDarkMode ? "#121212" : "#f5f5f5",
    primary: isDarkMode ? "#bb86fc" : "#6200ee",
    secoundary: isDarkMode ? "#03dac6" : "#03dac5",
    error: isDarkMode ? "#cf6679" : "#b00020",
    buttonAbout: isDarkMode ? "#bb86fc" : "#6200ee",
    buttonBooks: isDarkMode ? "#03dac5" : "#28a745",
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, color }}>
      {children}
    </ThemeContext.Provider>
  );
};
