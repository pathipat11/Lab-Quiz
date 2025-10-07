import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.REACT_APP_NATIVE_API_URL;

// ฟังก์ชันช่วยดึง token อัตโนมัติ
const getToken = async () => {
  return await AsyncStorage.getItem("authToken");
};

// ฟังก์ชันตรวจสอบ response
const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "API request failed");
  }
  return data;
};

// GET request
export const apiGet = async (endpoint: string) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return handleResponse(res);
};

// POST request
export const apiPost = async (endpoint: string, body: any) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

// PUT request
export const apiPut = async (endpoint: string, body: any) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

// DELETE request
export const apiDelete = async (endpoint: string) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return handleResponse(res);
};
