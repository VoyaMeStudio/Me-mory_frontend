import axiosInstance from "@/lib/axiosInstance";
import * as SecureStore from "expo-secure-store";

export const joinUser = async (body: {
  surName: string;
  firstName: string;
  koreanName: string;
  birth: string;
  nationality: string;
  alarm: boolean;
}) => {
  const token = await SecureStore.getItemAsync("access_token");

  console.log("[JOIN USER BODY]", body);
  console.log("[JOIN USER TOKEN]", token);

  const res = await axiosInstance.post("/api/auth/join", body, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  console.log("[JOIN USER SUCCESS]", res.data);

  return res.data;
};