import axiosInstance from "@/lib/axiosInstance";
import { useRouter } from "expo-router";

async function routeAfterLogin(router: ReturnType<typeof useRouter>) {
  try {
    const res = await axiosInstance.get("/api/users/me");
    console.log("로그인 후 /me 성공:", res.data);

    router.replace("/(tabs)");
  } catch (e: any) {
    console.error("로그인 후 /me 실패:", e?.response?.data);

    const message = e?.response?.data?.message ?? "";

    if (message.includes("회원 정보 입력을 완료해주세요")) {
      router.replace("/profile-setup");
      return;
    }

    console.error("예상 못한 로그인 후 분기 에러:", e);
  }
}