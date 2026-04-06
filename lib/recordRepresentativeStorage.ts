import AsyncStorage from '@react-native-async-storage/async-storage';

export type RepresentativeSlot = 'top' | 'bottom';

const KEY = 'recordRepresentativeSlot';

export async function persistRepresentativeSlot(slot: RepresentativeSlot): Promise<void> {
  await AsyncStorage.setItem(KEY, slot);
}

export async function getRepresentativeSlot(): Promise<RepresentativeSlot | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw === 'top' || raw === 'bottom') return raw;
  return null;
}
