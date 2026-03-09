import axiosInstance from "@/lib/axiosInstance";

export type ApiEmotion = {
  id: number;
  name: string;
  colorCode: string;
};

export type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

export async function getEmotions(): Promise<ApiEmotion[]> {
  const res = await axiosInstance.get<ApiEnvelope<ApiEmotion[]>>("/api/emotions");
  return res.data?.data ?? [];
}