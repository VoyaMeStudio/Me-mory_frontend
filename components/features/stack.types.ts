import { VisitedCountry } from "@/api/timeline";

export type PreviousTrip = {
  id: number;
  tripName: string;
  description: string;
  startDate: Date;
  endDate: Date;

  isArchived?: boolean;
  emotionId?: number;
  emotionName?: string;
  emotionColor?: string;

  countryCodes?: string[];
  visitedCountries?: VisitedCountry[];
  representativeImageUrl?: string | null;
};

export type TripEmotion = {
  id: number;
  key: string;
  label: string;
  color: string;
};

export type StackCardItem = {
  id: string;
  title: string;
  dateText: string;
  height: number;
  emotionColor: string;
};