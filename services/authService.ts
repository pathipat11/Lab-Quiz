import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPost, apiGet } from "./api";

export const login = async (email: string, password: string) => {
  const res: any = await apiPost("/signin", { email, password });
  const payload = res?.data ?? res;
  const token = payload?.token;
  if (!token) throw new Error("No token returned from /signin");

  await AsyncStorage.setItem("authToken", token);
  await AsyncStorage.setItem("user", JSON.stringify(payload));
  return { token, user: payload };
};

export const logout = async () => {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("user");
};

export const getProfile = async () => {
  const res: any = await apiGet("/profile");
  return res?.data ?? res;
};
