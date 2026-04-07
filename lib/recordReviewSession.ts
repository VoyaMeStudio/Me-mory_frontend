import type { RepresentativeSlot } from '@/lib/recordRepresentativeStorage';

export type RecordReviewSession = {
  mainUri: string;
  selfieUri: string;
  topFacing: 'back' | 'front';
  representativeSlot: RepresentativeSlot;
};

let session: RecordReviewSession | null = null;

/** In-memory only — survives navigation within the app until cleared or the JS runtime reloads. */
export function setRecordReviewSession(next: RecordReviewSession | null) {
  session = next;
}

export function getRecordReviewSession(): RecordReviewSession | null {
  return session;
}
