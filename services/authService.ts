import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPost, apiGet } from "./api";

// รองรับทั้งแบบ { token } และ { data: { token, ... } }
export const login = async (email: string, password: string) => {
  const res: any = await apiPost("/signin", { email, password });

  // ถ้าเซิร์ฟเวอร์หุ้มด้วย data ให้ดึงออกมา
  const payload = res?.data ?? res;
  const token = payload?.token;
  if (!token) {
    console.log("Unexpected signin payload:", res);
    throw new Error("No token returned from /signin");
  }

  await AsyncStorage.setItem("authToken", token);

  // ถ้ามีข้อมูลผู้ใช้มากับ /signin ก็เก็บเลย (ตามที่เห็นใน log)
  // payload = { _id, email, firstname, lastname, ..., token }
  await AsyncStorage.setItem("user", JSON.stringify(payload));

  return { token, user: payload };
};

export const logout = async () => {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("user");
};

// โปรไฟล์บางระบบก็หุ้มด้วย data เช่นกัน
export const getProfile = async () => {
  const res: any = await apiGet("/profile");
  return res?.data ?? res;
};
