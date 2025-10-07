import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const EXTRA = (Constants.expoConfig?.extra as any) || {};
const API_URL: string = EXTRA.apiUrl;
const API_KEY: string = EXTRA.apiKey;
console.log("API_URL =", API_URL);
console.log("EXTRA =", EXTRA);


if (!API_URL) throw new Error("Missing expo.extra.apiUrl");
if (!API_KEY) console.warn("⚠️ Missing expo.extra.apiKey — requests will be rejected.");

const getToken = async () => AsyncStorage.getItem("authToken");

const handleResponse = async (res: Response) => {
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) throw new Error((data?.message || data?.error) ?? `HTTP ${res.status}`);
  return data;
};

const withApiKey = (headers: Record<string, string> = {}) => ({
  "x-api-key": API_KEY,
  ...headers,
});

export const apiGet = async (endpoint: string) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: withApiKey(token ? { Authorization: `Bearer ${token}` } : {}),
  });
  return handleResponse(res);
};

export const apiPost = async (endpoint: string, body: any) => {
  const token = await getToken();
    console.log("POST", `${API_URL}${endpoint}`, "body:", body, "headers:", {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: withApiKey({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};


export const apiPut = async (endpoint: string, body: any) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: withApiKey({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};

export const apiDelete = async (endpoint: string) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers: withApiKey(token ? { Authorization: `Bearer ${token}` } : {}),
  });
  return handleResponse(res);
};
