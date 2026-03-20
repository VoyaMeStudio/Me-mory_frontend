import { GnbTab, GnbTabBar } from '@/components/common/GnbTabBar';
import { router as globalRouter, Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<GnbTab>('home');

  useEffect(() => {
    if (pathname.includes('/record')) setActiveTab('record');
    else if (pathname.includes('/board')) setActiveTab('board');
    else setActiveTab('home');
  }, [pathname]);

  const handleTabPress = (tab: GnbTab) => {
    if (tab === 'record') {
      // Push onto root stack so record opens as fullScreenModal (no bottom nav)
      globalRouter.push('/record');
      return;
    }
    setActiveTab(tab);
    if (tab === 'home') router.replace('/(tabs)/home');
    if (tab === 'board') router.replace('/(tabs)/board');
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={() => <GnbTabBar activeTab={activeTab} onTabPress={handleTabPress} />}
    >
      <Tabs.Screen name="home" options={{ title: '홈' }} />
      <Tabs.Screen name="board" options={{ title: '보드' }} />
    </Tabs>
  );
}