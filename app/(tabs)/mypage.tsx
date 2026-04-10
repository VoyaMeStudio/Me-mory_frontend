import MypageHeader from "@/components/features/mypage/MypageHeader";
import PassportCard from "@/components/features/mypage/PassportCard";
import VisitedCountriesDialog from "@/components/features/mypage/VisitedCountriesDialog";
import useMypage from "@/hooks/useMypage";
import { Colors } from "@/styles/colors";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MypageScreen() {
  const router = useRouter();
  const { mypage, visitedCountries, isLoading, error, refetch } = useMypage();
  const [isCountriesDialogVisible, setIsCountriesDialogVisible] = useState(false);

  const userName = useMemo(() => {
    if (!mypage?.user?.koreanName) return "회원";
    return mypage.user.koreanName;
  }, [mypage]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MypageHeader
          onPressBack={() => router.back()}
          onPressSettings={() => router.push("/settings")}
        />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={Colors.grey700} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !mypage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MypageHeader
          onPressBack={() => router.back()}
          onPressSettings={() => router.push("/settings")}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {error ?? "마이페이지 정보를 불러오지 못했습니다."}
          </Text>
          <Text style={styles.retryText} onPress={refetch}>
            다시 시도
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <MypageHeader
        onPressBack={() => router.back()}
        onPressSettings={() => router.push("/settings")}
      />

      <View style={styles.content}>
        <PassportCard
          mypage={mypage}
          visitedCountries={visitedCountries}
          onPressCountries={() => setIsCountriesDialogVisible(true)}
        />
      </View>

      <VisitedCountriesDialog
        visible={isCountriesDialogVisible}
        countries={visitedCountries}
        onClose={() => setIsCountriesDialogVisible(false)}
        userName={userName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary50,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    color: Colors.grey700,
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: Colors.grey900,
    textDecorationLine: "underline",
  },
});