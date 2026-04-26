import axios from "axios";
import * as SecureStore from "expo-secure-store";

const baseURL = "https://voyame-studio.org";

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const url = config.url ?? "";

  const isPublicAuthRequest =
    url.startsWith("/api/auth/login/kakao") ||
    url.startsWith("/auth/login/kakao");

  const isJoinRequest = url.startsWith("/api/auth/join");

  if (isPublicAuthRequest) {
    delete (config.headers as any)?.Authorization;
  } 

  else if (isJoinRequest) {
    const token = await SecureStore.getItemAsync("access_token");

    console.log("[JOIN TOKEN]", token);

    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    } else {
      delete (config.headers as any)?.Authorization;
    }
  } 

  else {
    const token = await SecureStore.getItemAsync("access_token");

    console.log("[AXIOS TOKEN]", token);

    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }

  const fullUrl = `${config.baseURL ?? ""}${config.url ?? ""}`;

  console.log("AXIOS REQUEST", {
    method: config.method,
    url: fullUrl,
    hasAuthHeader: !!(config.headers as any)?.Authorization,
  });

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error?.config?.url ?? "";

    console.log("AXIOS ERROR", {
      status: error?.response?.status,
      url,
      data: error?.response?.data,
    });

    const isJoinRequest = url.startsWith("/api/auth/join");
    const isMeRequest = url.startsWith("/api/users/me");

    if (
      error?.response?.status === 401 &&
      !isJoinRequest &&
      !isMeRequest
    ) {
      console.log("[AUTH] 토큰 삭제");

      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;