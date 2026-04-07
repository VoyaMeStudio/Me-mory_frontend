import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";
import type { MypageData, VisitedCountry } from "@/types/mypage";
import React, { useMemo } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import MypageBgStamp from "@/assets/images/mypage_1.svg";
import MypageCircleStamp from "@/assets/images/mypage_2.svg";
import MypageBarcode from "@/assets/images/mypage_3.svg";

type Props = {
  mypage: MypageData;
  visitedCountries: VisitedCountry[];
  onPressCountries?: () => void;
};

export default function PassportCard({
  mypage,
  visitedCountries,
  onPressCountries,
}: Props) {
  const { user, statistics } = mypage;
  const isTwoLine = visitedCountries.length >= 12;

  const passportBirth = formatPassportBirth(user.birth);

  const profileImageUri = useMemo(() => {
    if (!user.profileImageUrl) return null;
    const separator = user.profileImageUrl.includes("?") ? "&" : "?";
    return `${user.profileImageUrl}${separator}v=${encodeURIComponent(
      user.birth ?? "profile"
    )}`;
  }, [user.profileImageUrl, user.birth]);
console.log("현재 전달된 프로필 URL: ", user.profileImageUrl);
  return (
    <View style={styles.wrapper}>
      <View style={styles.ticketCard}>
        <View style={styles.cardBorder} pointerEvents="none" />

        <View style={styles.bgStampWrap} pointerEvents="none">
          <MypageBgStamp width={186} height={133} />
        </View>

        <View style={styles.topSection}>
          <View style={styles.nationalityHeader}>
            <Text style={styles.nationalityLine}>
              대한민국 REPUBLIC OF KOREA
            </Text>
          </View>

          <View style={styles.identityRow}>
            <View style={styles.photoFrame}>
              {!!profileImageUri && (
                <Image
                  source={{ uri: profileImageUri }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              )}
            </View>

            <View style={styles.infoArea}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>성/Surname</Text>
                <Text style={styles.fieldValue}>{user.surName}</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>이름/First name</Text>
                <Text style={styles.fieldValue}>{user.firstName}</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>한글 성명</Text>
                <Text style={styles.fieldValue}>{user.koreanName}</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>생년월일 / Date of birth</Text>
                <Text style={styles.fieldValue}>{user.birth}</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>국적 / Nationality</Text>
                <Text style={styles.fieldValue}>대한민국</Text>
              </View>
            </View>
          </View>

          <View style={styles.codeArea}>
            <Text
              style={styles.codeLine}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.92}
            >
              {`${(user.surName ?? "").toUpperCase()} << ${(user.firstName ?? "").toUpperCase()} << KOR <<<<<<<<<<<<<<<<<<<<<<`}
            </Text>
            <Text
              style={styles.codeLine}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.92}
            >
              {`${passportBirth} <<<<<<<<<<<<<<<<<<<<<< ME-MORY`}
            </Text>
          </View>
        </View>

        <View style={styles.cutLineWrap}>
          <View style={styles.middleCutLineWrap}>
            <View style={styles.middleCutLine} />
          </View>
          <View style={styles.leftCut} />
          <View style={styles.rightCut} />
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statistics.countryCount}</Text>
              <Text style={styles.statLabel}>방문한 나라</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statistics.diaryCount}</Text>
              <Text style={styles.statLabel}>일기</Text>
            </View>
          </View>

          <Pressable onPress={onPressCountries} style={styles.flagsWrap}>
            <View
              style={[
                styles.flagsContainer,
                isTwoLine && styles.flagsContainerTwoLine,
              ]}
            >
              {visitedCountries.map((country) => (
                <Text key={country.countryCode} style={styles.flagEmoji}>
                  {country.flag}
                </Text>
              ))}
            </View>
          </Pressable>

          <View style={styles.bottomDecoration}>
            <View style={styles.circleStampWrap} pointerEvents="none">
              <View style={styles.circleStampInner}>
                <MypageCircleStamp
                  width={193}
                  height={123}
                  style={styles.circleStampSvg}
                />
              </View>
            </View>

            <View style={styles.barcodeWrap} pointerEvents="none">
              <MypageBarcode width={300} height={20} />
            </View>

            <Text style={styles.footerVersion}>me-mory-2025-ver.1</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function formatPassportBirth(input?: string) {
  if (!input) return "2001JAN29";

  const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    return `${yyyy}${monthToEng(mm)}${dd}`;
  }

  const spacedMatch = input.match(/^(\d{4})[.\-/ ](\d{1,2})[.\-/ ](\d{1,2})$/);
  if (spacedMatch) {
    const [, yyyy, mm, dd] = spacedMatch;
    return `${yyyy}${monthToEng(mm)}${String(dd).padStart(2, "0")}`;
  }

  const korFullMatch = input.match(/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일$/);
  if (korFullMatch) {
    const [, yyyy, mm, dd] = korFullMatch;
    return `${yyyy}${monthToEng(mm)}${String(dd).padStart(2, "0")}`;
  }

  const slashEngMatch = input.match(/(\d{1,2})\s*월\/([A-Za-z]{3})\s*(\d{4})/);
  if (slashEngMatch) {
    const monthEng = slashEngMatch[2].toUpperCase();
    const year = slashEngMatch[3];
    const dayPrefix = input.match(/^(\d{1,2})/)?.[1] ?? "01";
    return `${year}${monthEng}${String(dayPrefix).padStart(2, "0")}`;
  }

  const fallbackDate = new Date(input);
  if (!Number.isNaN(fallbackDate.getTime())) {
    const yyyy = fallbackDate.getFullYear();
    const mm = fallbackDate.getMonth() + 1;
    const dd = fallbackDate.getDate();
    return `${yyyy}${monthToEng(mm)}${String(dd).padStart(2, "0")}`;
  }

  return "2001JAN29";
}

function monthToEng(month: string | number) {
  const m = typeof month === "string" ? Number(month) : month;
  const map = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return map[Math.max(1, Math.min(12, m)) - 1];
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },

  ticketCard: {
    width: 345,
    height: 600,
    backgroundColor: "#FCFAF5",
    borderRadius: 26,
    overflow: "hidden",
    position: "relative",
  },

  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "#DDD2C2",
    borderRadius: 26,
    zIndex: 0,
  },

  bgStampWrap: {
    position: "absolute",
    top: 25,
    left: -30,
    zIndex: 0,
    opacity: 0.34,
  },

  topSection: {
    paddingTop: 24,
    paddingHorizontal: 18,
    paddingBottom: 10,
    height: 345,
    zIndex: 1,
  },

  nationalityHeader: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingTop: 8,
    overflow: "visible",
  },

  nationalityLine: {
    ...typography.head6_18_regular,
    color: "#161616",
    fontSize: 26,
    lineHeight: 34,
    textAlign: "center",
    ...(Platform.OS === "android"
      ? {
          includeFontPadding: true,
          textAlignVertical: "center" as const,
        }
      : {}),
  },

  identityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  photoFrame: {
    width: 151,
    height: 194,
    backgroundColor: "#E9F0ED",
    overflow: "hidden",
    marginRight: 18,
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  infoArea: {
    flex: 1,
    paddingTop: 5,
  },

  fieldGroup: {
    marginBottom: 5,
  },

  fieldLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    color: "#A4A4A4",
    marginBottom: -5,
  },

  fieldValue: {
    ...typography.body2_18_regular,
    fontSize: 18,
    lineHeight: 24,
    color: "#161616",
    paddingTop: 3,
    ...(Platform.OS === "android"
      ? {
          includeFontPadding: true,
          textAlignVertical: "center" as const,
        }
      : {}),
  },

  codeArea: {
    marginTop: 18,
    paddingLeft: 8,
    paddingRight: 8,
  },

  codeLine: {
    fontSize: 12,
    color: "#909090",
    lineHeight: 20,
  },

  cutLineWrap: {
    position: "relative",
    height: 46,
    justifyContent: "center",
    zIndex: 2,
  },

  middleCutLineWrap: {
    height: 1,
    marginHorizontal: 24,
    overflow: "hidden",
  },

  middleCutLine: {
    height: 2,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#DFD6C8",
    borderRadius: 1,
  },

  leftCut: {
    position: "absolute",
    left: -22,
    top: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary50,
    borderWidth: 1,
    borderColor: "#DDD2C2",
    zIndex: 4,
  },

  rightCut: {
    position: "absolute",
    right: -22,
    top: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary50,
    borderWidth: 1,
    borderColor: "#DDD2C2",
    zIndex: 4,
  },

  bottomSection: {
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    height: 209,
    position: "relative",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 72,
    marginBottom: 14,
  },

  statItem: {
    alignItems: "center",
  },

  statNumber: {
    ...typography.head3_24_regular,
    fontSize: 28,
    lineHeight: 32,
    color: "#161616",
    marginBottom: 6,
  },

  statLabel: {
    ...typography.body4_14_regular,
    color: "#1F1C17",
    fontSize: 22,
    lineHeight: 26,
  },

  flagsWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    marginBottom: 10,
  },

  flagsContainer: {
    maxWidth: 230,
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    alignItems: "center",
  },

  flagsContainerTwoLine: {
    flexWrap: "wrap",
    rowGap: 4,
  },

  flagEmoji: {
    fontSize: 15,
    marginHorizontal: 1.5,
    marginVertical: 1,
  },

  bottomDecoration: {
    marginTop: 0,
    minHeight: 74,
    justifyContent: "flex-end",
    position: "relative",
  },

  barcodeWrap: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 40,
    alignItems: "center",
    zIndex: 2,
  },

  circleStampWrap: {
    position: "absolute",
    right: -40,
    bottom: -8,
    width: 240,
    height: 180,
    zIndex: 0,
    opacity: 0.15,
    overflow: "visible",
  },

  circleStampInner: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 193,
    height: 123,
    overflow: "visible",
  },

  circleStampSvg: {
    transform: [{ rotate: "-16.825deg" }, { translateY: 20 }],
  },

  footerVersion: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    fontSize: 8,
    color: "#988D7A",
    zIndex: 3,
  },
});