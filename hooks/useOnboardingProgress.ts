import { ONBOARDING_ROUTES } from '@/constants/onboarding';
import { usePathname } from 'expo-router';

export function useOnboardingProgress() {
  const pathname = usePathname();

  const idx = ONBOARDING_ROUTES.indexOf(pathname as any);
  const activeIndex = idx >= 0 ? idx : 0;

  return { activeIndex, total: ONBOARDING_ROUTES.length };
}
