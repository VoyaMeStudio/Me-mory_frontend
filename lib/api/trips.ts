import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse, TripResponseDto } from "./types";
import type { CardItem } from "@/components/features/card/types";

/** Format API date (YYYY-MM-DD) to display (YYYY.MM.DD) */
function formatDatePart(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return [y, m, d].filter(Boolean).join(".");
}

/** Map trip response to card item for the card screen */
export function tripToCardItem(trip: TripResponseDto): CardItem {
  const start = formatDatePart(trip.startDate);
  const end = formatDatePart(trip.endDate);
  const dateRange =
    start && end ? `${start} - ${end}` : start || end || "";

  return {
    id: String(trip.id),
    title: trip.tripName ?? "",
    dateRange,
    description: trip.description ?? "",
    imageUri: trip.representativeImageUrl,
    imageGrid: trip.representativeImageUrl
      ? [trip.representativeImageUrl]
      : undefined,
  };
}

/**
 * 사용자 여행 전체 목록 조회
 * GET /api/users/me/trips
 * @see https://voyame-studio.org/swagger-ui/index.html - Trip 여행 관리 API
 */
export async function getTrips(): Promise<TripResponseDto[]> {
  const { data } = await axiosInstance.get<ApiResponse<TripResponseDto[]>>(
    "/api/users/me/trips"
  );
  if (data?.data == null) {
    throw new Error(data?.message ?? "여행 목록 조회 실패");
  }
  return Array.isArray(data.data) ? data.data : [];
}
