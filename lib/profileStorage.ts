import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocalProfile = {
  photoUri: string | null;
  nameKo: string;
  birthDate: string | null; // YYYY-MM-DD
  nameEnLast: string;
  nameEnFirst: string;
  updatedAt: number;
};

const KEY = 'local_profile_v1';

export async function saveLocalProfile(profile: Omit<LocalProfile, 'updatedAt'>) {
  const data: LocalProfile = { ...profile, updatedAt: Date.now() };
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
  return data;
}

export async function loadLocalProfile(): Promise<LocalProfile | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalProfile;
  } catch {
    return null;
  }
}

export async function clearLocalProfile() {
  await AsyncStorage.removeItem(KEY);
}