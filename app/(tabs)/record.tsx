import { Redirect } from 'expo-router';

/**
 * Record is implemented as a root-stack scene (`/record`), not a tab screen.
 * Keeps any stray `/(tabs)/record` links aligned with that route.
 */
export default function RecordTabRedirect() {
  return <Redirect href="/record" />;
}
