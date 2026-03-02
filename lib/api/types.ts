/**
 * API types aligned with Me-mory backend OpenAPI spec
 * @see https://voyame-studio.org/swagger-ui/index.html
 * @see https://voyame-studio.org/v3/api-docs
 */

/** Common API response wrapper */
export interface ApiResponse<T> {
  code?: number;
  message?: string;
  data: T;
}

/** Timeline response (GET /api/users/me/timeline) */
export interface TimelineResponseDto {
  trips: TimelineTripDto[];
}

/** Single trip in timeline (stack/card view) */
export interface TimelineTripDto {
  tripId: number;
  tripName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  representativeImageUrl?: string;
  emotionName?: string;
  emotionColor?: string;
  visitedCountries?: VisitedCountryInfoDto[];
  past?: boolean;
}

export interface VisitedCountryInfoDto {
  countryCode?: string;
  countryName?: string;
}

/** Trip list response (GET /api/users/me/trips) */
export interface TripResponseDto {
  id: number;
  tripName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  representativeImageUrl?: string;
  userId?: number;
  userKakaoId?: string;
  userKoreanName?: string;
  themeId?: number;
  themeName?: string;
  themeSampleImageUrl?: string;
  themeCardImageUrl?: string;
  diaryCount?: number;
}
