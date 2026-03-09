import type { TripEmotion } from "@/components/features/stack.types";
import axiosInstance from "@/lib/axiosInstance";
import { useEffect, useMemo, useState } from "react";

type ApiEmotion = {
  id: number;
  name: string;
  colorCode: string;
};

type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

export function useEmotions(enabled: boolean = true) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<ApiEmotion[]>([]);

  useEffect(() => {
    if (!enabled) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get<ApiEnvelope<ApiEmotion[]>>("/api/emotions");
        if (!alive) return;

        setRaw(res.data?.data ?? []);
      } catch (e) {
        if (!alive) return;
        setError("감정 목록을 불러오지 못했습니다.");
        setRaw([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [enabled]);

  const emotions: TripEmotion[] = useMemo(() => {
    return raw
      .map((e) => ({ ...e, name: e.name?.trim?.() ?? e.name }))
      .filter((e) => e.name !== "기본" && e.id !== 0)
      .map((e) => ({
        id: e.id,
        key: String(e.id),
        label: e.name,
        color: e.colorCode,
      }));
  }, [raw]);

  const findById = (id?: number | null) => {
    if (!id) return undefined;
    return emotions.find((e) => e.id === id);
  };

  return { emotions, loading, error, findById };
}