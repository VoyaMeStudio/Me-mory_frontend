import { GnbTab, GnbTabBar } from "@/components/common/GnbTabBar";
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {

  const [activeTab, setActiveTab] = React.useState<GnbTab>("home");

  const handleTabPress = (tab: GnbTab) => {
    setActiveTab(tab);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, 
      }}

      tabBar={() => (
        <GnbTabBar activeTab={activeTab} onTabPress={handleTabPress} />
      )}
    >

      <Tabs.Screen name="home" options={{ title: "홈" }} />
      <Tabs.Screen name="record" options={{ title: "기록하기" }} />
      <Tabs.Screen name="board" options={{ title: "보드" }} />
    </Tabs>
  );
}
