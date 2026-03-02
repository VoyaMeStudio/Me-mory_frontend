import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse, TimelineResponseDto, TimelineTripDto } from "./types";
import type { CardItem } from "@/components/features/card/types";

/** Format API date (YYYY-MM-DD) to display (YYYY.MM.DD) */
function formatDatePart(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return [y, m, d].filter(Boolean).join(".");
}

/** Map timeline trip to card item for the stack view */
export function timelineTripToCardItem(trip: TimelineTripDto): CardItem {
  const start = formatDatePart(trip.startDate);
  const end = formatDatePart(trip.endDate);
  const dateRange =
    start && end ? `${start} - ${end}` : start || end || "";

  return {
    id: String(trip.tripId),
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
 * 타임라인/스택뷰 조회 (카드 스택에 표시할 여행 목록)
 * GET /api/users/me/timeline
 * @see https://voyame-studio.org/swagger-ui/index.html - Timeline/StackView
 */
export async function getTimeline(): Promise<TimelineResponseDto> {
  const { data } = await axiosInstance.get<ApiResponse<TimelineResponseDto>>(
    "/api/users/me/timeline"
  );
  if (data?.data == null) {
    throw new Error(data?.message ?? "타임라인 조회 실패");
  }
  return data.data;
}
