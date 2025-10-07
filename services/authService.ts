import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.REACT_APP_NATIVE_API_URL;

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");

  // Save token
  await AsyncStorage.setItem("authToken", data.token);
  return data;
};

export const logout = async () => {
  await AsyncStorage.removeItem("authToken");
};

export const getProfile = async () => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
  return data.user;
};
