import { Colors } from '@/styles/colors';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import CollectionTabs, { CollectionTabKey } from '@/components/features/collection/CollectionTabs';
import StackScreen from '@/components/features/stack/StackScreen';

function EmptyView() {
  return <View style={{ flex: 1 }} />;
}

export default function IndexScreen() {
  const [tab, setTab] = useState<CollectionTabKey>('card'); 

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CollectionTabs value={tab} onChange={setTab} />
      </View>

      <View style={styles.content}>
        {tab === 'card' && <EmptyView />}
        {tab === 'stack' && <StackScreen />}    
        {tab === 'timeline' && <EmptyView />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors?.primary50 ?? '#F7F5F0' },
  header: { paddingTop: 50, paddingHorizontal: 24 },
  content: { flex: 1 },
});