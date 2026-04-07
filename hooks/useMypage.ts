import { getMyPage, getMyPageVisitedCountries } from "@/api/mypage";
import type { UseMypageResult, VisitedCountry } from "@/types/mypage";
import { countryCodeToFlagEmoji } from "@/utils/countryFlag";
import { useCallback, useEffect, useState } from "react";

export default function useMypage(): UseMypageResult {
  const [mypage, setMypage] = useState<UseMypageResult["mypage"]>(null);
  const [visitedCountries, setVisitedCountries] = useState<VisitedCountry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [mypageRes, countriesRes] = await Promise.all([
        getMyPage(),
        getMyPageVisitedCountries(),
      ]);

      setMypage({
        user: mypageRes.data.user,
        statistics: mypageRes.data.statistics,
        flags: mypageRes.data.flags,
      });

      const adaptedCountries: VisitedCountry[] =
        countriesRes.data.visitedCountries.map((country) => ({
          countryCode: country.countryCode,
          countryName: country.countryName,
          flag: countryCodeToFlagEmoji(country.countryCode),
        }));

      setVisitedCountries(adaptedCountries);
   } catch (e: any) {
  console.error("[useMypage] fetch error:", e);

  const serverMessage =
    e?.response?.data?.message ?? "마이페이지 정보를 불러오지 못했습니다.";

  setError(serverMessage);
} finally {
  setIsLoading(false);
}
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    mypage,
    visitedCountries,
    isLoading,
    error,
    refetch: fetchAll,
  };
}