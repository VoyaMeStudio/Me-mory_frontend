import axiosInstance from "@/lib/axiosInstance";
import type {
    GetMyPageResponse,
    GetVisitedCountriesResponse,
} from "@/types/mypage";

export async function getMyPage() {
  const res = await axiosInstance.get<GetMyPageResponse>("/api/users/me");
  return res.data;
}

export async function getMyPageVisitedCountries() {
  const res = await axiosInstance.get<GetVisitedCountriesResponse>(
    "/api/users/me/mypage-visited-countries"
  );
  return res.data;
}