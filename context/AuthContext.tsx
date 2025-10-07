import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

interface User {
  _id: string;
  username: string;
  email: string;
  // เพิ่ม field อื่น ๆ ตามที่ backend ส่งมา
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL: string = Constants.expoConfig?.extra?.apiUrl || "";

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          await fetchProfile(token);
        }
      } catch (err) {
        console.error("Error loading user from storage:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (token: string) => {
    await AsyncStorage.setItem("authToken", token);
    await fetchProfile(token);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
