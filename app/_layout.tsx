import React from "react";
import { Stack, usePathname } from "expo-router";
import ThemeToggle from "./components/ThemeToggle";
import AuthToggle from "./components/AuthToggle";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

const StackLayout: React.FC = () => {
  const { color } = useTheme();
  const pathname = usePathname();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: color.background,
        },
        headerTintColor: color.text,
        headerTitleStyle: {
          color: color.text,
        },
        headerTitleAlign: "center",
        headerLeft: () => (pathname === "/main" ? <AuthToggle /> : null),
        headerRight: () => <ThemeToggle />,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="main" options={{ title: "Home" }} />
      <Stack.Screen name="signin/index" options={{ title: "Sign In" }} />
      <Stack.Screen name="profile/index" options={{ title: "Profile" }} />
      <Stack.Screen name="class/[year]" options={{ title: "Class" }} />
      <Stack.Screen name="feed/index" options={{ title: "Feed" }} />
      <Stack.Screen name="feed/[id]" options={{ title: "Post" }} />
      <Stack.Screen name="setting" options={{ title: "Setting" }} />

    </Stack>
  );
};

const Layout: React.FC = () => {
  return (
    <ThemeProvider>
      <StackLayout />
    </ThemeProvider>
  );
};

export default Layout;
