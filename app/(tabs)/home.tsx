import { Colors } from "@/styles/colors";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import CollectionHeader from "@/components/features/home/homeHeader";
import CollectionTabs, { CollectionTabKey } from "@/components/features/home/homeTab";
import StackScreen from "@/components/features/stack/StackScreen";

function EmptyView() {
  return <View style={{ flex: 1 }} />;
}

export default function IndexScreen() {
  const [tab, setTab] = useState<CollectionTabKey>("card");
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
  
      <View style={{ paddingTop: 6}}>
        <CollectionHeader title="모음" onPressProfile={() => {}} />

        <View style={styles.tabsWrap}>
          <CollectionTabs value={tab} onChange={setTab} />
        </View>
      </View>

      <View style={styles.content}>

        {tab === "card" && <EmptyView />}
        {tab === "stack" && <StackScreen />}
        {tab === "timeline" && <EmptyView />}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors?.primary50 ?? "#F7F5F0" },
  tabsWrap: { paddingHorizontal: 24 },
  content: { flex: 1 },
});