import axiosInstance from "@/lib/axiosInstance";

export type VisitedCountry = {
  countryCode: string;
  countryName: string;
  emoji?: string;
  emotionName?: string;
  emotionColor?: string;
};

export type TimelineTrip = {
  tripId: number;
  tripName: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  representativeImageUrl?: string | null;
  emotionName?: string | null;
  emotionColor?: string | null;
  visitedCountries?: VisitedCountry[] | null;
  isStored?: boolean | null;
  past?: boolean | null;
};

type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

export type GetTimelineResponseData = {
  trips: TimelineTrip[];
};

export type UpsertPastTripBody = {
  tripName: string;
  description: string;
  startDate: string;
  endDate: string;
  countryCodes: string[];
  emotionId: number;
};

function unwrap<T>(res: { data: ApiEnvelope<T> }): T {
  return res.data.data;
}

export async function getTimeline(): Promise<GetTimelineResponseData> {
  const res = await axiosInstance.get<ApiEnvelope<GetTimelineResponseData>>(
    "/api/users/me/timeline"
  );
  return unwrap(res);
}

export async function createPastTrip(body: UpsertPastTripBody): Promise<void> {
  await axiosInstance.post("/api/users/me/timeline/past", body);
}

export async function updatePastTrip(
  tripId: number,
  body: UpsertPastTripBody
): Promise<void> {
  await axiosInstance.put(`/api/users/me/timeline/past/${tripId}`, body);
}

export async function deletePastTrip(tripId: number): Promise<void> {
  await axiosInstance.delete(`/api/users/me/timeline/past/${tripId}`);
}

export async function storePastTrip(tripId: number, stored: boolean): Promise<void> {
  await axiosInstance.patch(`/api/users/me/timeline/${tripId}/store`, {
    stored,
  });
}