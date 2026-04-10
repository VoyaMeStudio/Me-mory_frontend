import axios from "axios";
import * as SecureStore from "expo-secure-store";

const baseURL = "https://voyame-studio.org";
console.log("BASE URL:", baseURL);

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(async (config) => {
  const url = config.url ?? "";

  const isAuthRequest =
    url.startsWith("/api/auth/login/kakao") ||
    url.startsWith("/auth/login/kakao");

  if (isAuthRequest) {
    delete (config.headers as any)?.Authorization;
  } else {
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
    params: config.params,
    data: config.data,
    hasAuthHeader: !!(config.headers as any)?.Authorization,
  });

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("AXIOS ERROR", {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
      method: error?.config?.method,
      url: `${error?.config?.baseURL ?? ""}${error?.config?.url ?? ""}`,
      params: error?.config?.params,
      dataSent: error?.config?.data,
    });

    if (error?.response?.status === 401) {
      console.log("[AUTH] 401 발생 → 저장된 토큰 삭제");
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;