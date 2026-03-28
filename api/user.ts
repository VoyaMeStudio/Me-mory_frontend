import axiosInstance from "@/lib/axiosInstance";

export const joinUser = async (body: {
  surName: string;
  firstName: string;
  koreanName: string;
  birth: string;
  nationality: string;
  alarm: boolean; 
}) => {
  const res = await axiosInstance.post("/api/auth/join", body);
  return res.data;
};