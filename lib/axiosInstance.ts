import axios from "axios";
import * as SecureStore from "expo-secure-store";

const baseURL = "https://voyame-studio.org";
console.log("BASE URL:", baseURL);

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const url = config.url ?? "";
    const isAuthRequest =
      url.startsWith("/api/auth") || 
      url.startsWith("/auth") ||
      url.includes("kakao");

    if (isAuthRequest) {
      delete (config.headers as any)?.Authorization;
    } else {
      const token = await SecureStore.getItemAsync("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    console.log("AXIOS REQUEST:", config.baseURL, config.url, {
      hasAuthHeader: !!(config.headers as any)?.Authorization,
    });

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
