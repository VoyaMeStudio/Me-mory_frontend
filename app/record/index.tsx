import RecordScreen from '@/components/features/record/RecordScreen';

/**
 * Record scene — opened from the center GNB action via `router.push('/record')`.
 * Lives at the root stack (sibling to `(tabs)`) so it is a full screen, not a tab fragment.
 */
export default function RecordScene() {
  return <RecordScreen />;
}
