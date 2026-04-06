import { Slot } from 'expo-router';

/**
 * Layout for the `/record` scene — separate from `(tabs)` so the center GNB action
 * pushes a root-stack screen instead of a tab fragment.
 */
export default function RecordSceneLayout() {
  return <Slot />;
}
