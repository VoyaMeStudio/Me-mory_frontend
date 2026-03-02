// components/features/stack.types.ts
export type TripEmotion = {
  key: string;
  label: string;
  color: string; // ✅ 감정색(띠)
};

export type PreviousTrip = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  note?: string;
  countries: string[];
  emotion?: TripEmotion;
  createdAt: Date;
  isArchived?: boolean;
};

export type StackCardItem = {
  id: string;
  title: string;
  dateText: string;
  height: number;       // ✅ 62/70/...
  emotionColor: string; // ✅ 띠에 적용할 색
};