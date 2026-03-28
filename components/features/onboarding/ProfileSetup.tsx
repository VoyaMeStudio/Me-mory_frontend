import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  findNodeHandle,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { joinUser } from "@/api/user";
import UploadIcon from "@/assets/images/Image.svg";
import { Colors } from "@/styles/colors";
import { typography } from "@/styles/typography";

type FormState = {
  photoUri: string | null;
  nameKo: string;
  birthDate: Date | null;
  nameEnLast: string;
  nameEnFirst: string;
};

export default function ProfileSetup() {
  const router = useRouter();

  const scrollRef = useRef<ScrollView | null>(null);

  const nameKoRef = useRef<View | null>(null);
  const nameEnLastRef = useRef<View | null>(null);
  const nameEnFirstRef = useRef<View | null>(null);

  const [form, setForm] = useState<FormState>({
    photoUri: null,
    nameKo: "",
    birthDate: null,
    nameEnLast: "",
    nameEnFirst: "",
  });

  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filled = useMemo(() => {
    return (
      !!form.photoUri &&
      form.nameKo.trim().length > 0 &&
      !!form.birthDate &&
      form.nameEnLast.trim().length > 0 &&
      form.nameEnFirst.trim().length > 0
    );
  }, [form]);

  const birthText = useMemo(() => {
    if (!form.birthDate) return "생년월일을 입력해주세요.";
    return formatBirthForDisplay(form.birthDate);
  }, [form.birthDate]);

  const scrollToInput = (targetRef: React.RefObject<View | null>) => {
    const scrollNode = findNodeHandle(scrollRef.current);
    const targetNode = findNodeHandle(targetRef.current);

    if (!scrollNode || !targetNode) return;

    UIManager.measureLayout(
      targetNode,
      scrollNode,
      () => {},
      (_x, y) => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, y - 120),
          animated: true,
        });
      }
    );
  };

  const onPickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      console.error("갤러리 권한이 거부되었다.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (res.canceled) return;

    const uri = res.assets?.[0]?.uri ?? null;
    setForm((prev) => ({ ...prev, photoUri: uri }));
  };

  const onRemoveImage = () => {
    setForm((prev) => ({ ...prev, photoUri: null }));
  };

  const onConfirmDate = (date: Date) => {
    setIsDateOpen(false);
    setForm((prev) => ({ ...prev, birthDate: date }));
  };

const onSubmit = async () => {
    if (!filled || isSubmitting || !form.birthDate) return;

    try {
      setIsSubmitting(true);

      const payload = {
        surName: form.nameEnLast.trim(),
        firstName: form.nameEnFirst.trim(),
        koreanName: form.nameKo.trim(),
        birth: formatBirthForServer(form.birthDate),
        nationality: "REPUBLIC OF KOREA",
        alarm: true, 
      };

      console.log("회원가입 요청:", payload);

      const res = await joinUser(payload);

      console.log("회원가입 성공:", res);

      router.replace("/(tabs)");
    } catch (e: any) {
      console.error("회원가입 실패:", e);
      console.error("응답 상태:", e?.response?.status);
      console.error("응답 데이터:", e?.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.bg} />
        <View style={styles.bgOverlay} />

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>프로필을 입력해주세요!</Text>

          <View style={styles.photoWrap}>
            {!form.photoUri ? (
              <Pressable style={styles.photoEmpty} onPress={onPickImage}>
                <UploadIcon width={26} height={26} />
                <Text style={styles.photoHint}>터치해서 사진 업로드</Text>
              </Pressable>
            ) : (
              <View style={styles.photoFilled}>
                <Image source={{ uri: form.photoUri }} style={styles.photo} />
                <Pressable style={styles.photoRemoveBtn} onPress={onRemoveImage}>
                  <Text style={styles.photoRemoveText}>×</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.formWrap}>
            <View style={styles.row}>
              <View style={styles.col} ref={nameKoRef} collapsable={false}>
                <Text style={styles.label}>한글 성명</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={form.nameKo}
                    onChangeText={(t) => setForm((p) => ({ ...p, nameKo: t }))}
                    placeholder="한글 성명을 입력해주세요."
                    placeholderTextColor={Colors.grey500}
                    style={styles.input}
                    returnKeyType="next"
                    onFocus={() => scrollToInput(nameKoRef)}
                  />
                </View>
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>생년 월일</Text>
                <Pressable
                  style={styles.dateBox}
                  onPress={() => setIsDateOpen(true)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      !form.birthDate && { color: Colors.grey500 },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {birthText}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col} ref={nameEnLastRef} collapsable={false}>
                <Text style={styles.label}>영문 성</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={form.nameEnLast}
                    onChangeText={(t) =>
                      setForm((p) => ({ ...p, nameEnLast: t.toUpperCase() }))
                    }
                    placeholder="ex) KIM"
                    placeholderTextColor={Colors.grey500}
                    autoCapitalize="characters"
                    style={styles.input}
                    returnKeyType="next"
                    onFocus={() => scrollToInput(nameEnLastRef)}
                  />
                </View>
              </View>

              <View style={styles.col} ref={nameEnFirstRef} collapsable={false}>
                <Text style={styles.label}>영문 이름</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={form.nameEnFirst}
                    onChangeText={(t) =>
                      setForm((p) => ({ ...p, nameEnFirst: t.toUpperCase() }))
                    }
                    placeholder="ex) JI HYE"
                    placeholderTextColor={Colors.grey500}
                    autoCapitalize="characters"
                    style={styles.input}
                    returnKeyType="done"
                    onFocus={() => scrollToInput(nameEnFirstRef)}
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.scrollBottomSpace} />
        </ScrollView>

        <View style={styles.bottomWrap}>
          <Pressable
            style={[
              styles.startBtn,
              filled ? styles.startBtnEnabled : styles.startBtnDisabled,
              isSubmitting && styles.startBtnSubmitting,
            ]}
            onPress={onSubmit}
            disabled={!filled || isSubmitting}
          >
            <Text
              style={[
                styles.startBtnTextBase,
                filled ? styles.startBtnTextEnabled : styles.startBtnTextDisabled,
              ]}
            >
              {isSubmitting ? "저장 중..." : "시작하기"}
            </Text>
          </Pressable>
        </View>

        <DateTimePickerModal
          isVisible={isDateOpen}
          mode="date"
          onConfirm={onConfirmDate}
          onCancel={() => setIsDateOpen(false)}
          maximumDate={new Date()}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

function formatBirthForDisplay(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}년 ${mm}월 ${dd}일`;
}

function formatBirthForServer(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F3EFE6",
  },

  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary150,
    opacity: 0.12,
  },

  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 96,
    paddingBottom: 0,
    alignItems: "center",
  },

  title: {
    ...typography.head1_28_regular,
    color: "#3B372F",
    letterSpacing: -0.2,
    marginBottom: 22,
    textAlign: "center",
    lineHeight: 30,
  },

  photoWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: 28,
  },

  photoEmpty: {
    width: 233,
    height: 300,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8D2C8",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  photoHint: {
    ...typography.body2_18_regular,
    color: "#817F7C",
  },

  photoFilled: {
    width: 292,
    height: 292,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8D2C8",
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  photoRemoveBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  photoRemoveText: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: -1,
  },

  formWrap: {
    width: "100%",
    marginTop: 2,
    gap: 22,
  },

  row: {
    width: "100%",
    flexDirection: "row",
    gap: 26,
  },

  col: {
    flex: 1,
  },

  label: {
    ...typography.head3_24_regular,
    color: Colors.primary950,
    marginBottom: 2,
  },

  inputBox: {
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey550,
    justifyContent: "flex-end",
    paddingBottom: 4,
  },

  input: {
    ...typography.body2_18_regular,
    paddingVertical: 0,
    color: Colors.primary950,
    ...(Platform.OS === "android" && { includeFontPadding: false }),
  },

  dateBox: {
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey550,
    justifyContent: "flex-end",
    paddingBottom: 4,
  },

  dateText: {
    ...typography.body2_18_regular,
    color: Colors.primary950,
    ...(Platform.OS === "android" && { includeFontPadding: false }),
  },

  scrollBottomSpace: {
    height: 220,
  },

  bottomWrap: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 26 : 20,
    backgroundColor: "transparent",
  },

  startBtn: {
    height: 60,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  startBtnDisabled: {
    backgroundColor: Colors.grey200,
    borderWidth: 0.5,
    borderColor: Colors.grey300,
  },

  startBtnEnabled: {
    backgroundColor: Colors.primary900,
    borderWidth: 0,
  },

  startBtnSubmitting: {
    opacity: 0.7,
  },

  startBtnTextBase: {
    ...typography.head3_24_regular,
    letterSpacing: -0.24,
    textAlign: "center",
  },

  startBtnTextDisabled: {
    color: Colors.grey500,
  },

  startBtnTextEnabled: {
    color: Colors.primary50,
  },
});