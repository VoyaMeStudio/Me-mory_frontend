import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import UploadIcon from '@/assets/images/Image.svg';
import { Colors } from '@/styles/colors';
import { typography } from '@/styles/typography';

type FormState = {
  photoUri: string | null;
  nameKo: string;
  birthDate: Date | null;
  nameEnLast: string;
  nameEnFirst: string;
};

type LocalProfile = {
  photoUri: string | null;
  nameKo: string;
  birthDate: string | null; // YYYY-MM-DD
  nameEnLast: string;
  nameEnFirst: string;
  updatedAt: number;
};

const PROFILE_KEY = 'local_profile_v1';

export default function ProfileSetup() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    photoUri: null,
    nameKo: '',
    birthDate: null,
    nameEnLast: '',
    nameEnFirst: '',
  });

  const [isDateOpen, setIsDateOpen] = useState(false);
  
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as LocalProfile;

        setForm({
          photoUri: saved.photoUri ?? null,
          nameKo: saved.nameKo ?? '',
          birthDate: saved.birthDate ? new Date(saved.birthDate) : null,
          nameEnLast: saved.nameEnLast ?? '',
          nameEnFirst: saved.nameEnFirst ?? '',
        });
      } catch {
  
      }
    })();
  }, []);

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
    if (!form.birthDate) return '생년월일을 입력해주세요.';
    const d = form.birthDate;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}년 ${mm}월 ${dd}일`;
  }, [form.birthDate]);

  const onPickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 업로드하려면 갤러리 권한이 필요하다.');
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

  // 임시 로컬 저장
  const saveLocalProfile = async () => {
    const payload: LocalProfile = {
      photoUri: form.photoUri,
      nameKo: form.nameKo.trim(),
      birthDate: form.birthDate ? form.birthDate.toISOString().slice(0, 10) : null,
      nameEnLast: form.nameEnLast.trim(),
      nameEnFirst: form.nameEnFirst.trim(),
      updatedAt: Date.now(),
    };

    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(payload));
  };

  const onSubmit = async () => {
    if (!filled) return;

    try {
      await saveLocalProfile(); 
      router.replace('/(tabs)');
    } catch {
      Alert.alert('저장 실패', '프로필 정보를 로컬에 저장하지 못했다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bg} />
      <View style={styles.bgOverlay} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
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
              <View style={styles.col}>
                <Text style={styles.label}>한글 성명</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={form.nameKo}
                    onChangeText={(t) => setForm((p) => ({ ...p, nameKo: t }))}
                    placeholder="한글 성명을 입력해주세요."
                    placeholderTextColor={Colors.grey500}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>생년 월일</Text>
                <Pressable style={styles.dateBox} onPress={() => setIsDateOpen(true)}>
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
              <View style={styles.col}>
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
                  />
                </View>
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>영문 이름</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={form.nameEnFirst}
                    onChangeText={(t) =>
                      setForm((p) => ({ ...p, nameEnFirst: t.toUpperCase() }))
                    }
                    placeholder="ex) JI YEON"
                    placeholderTextColor={Colors.grey500}
                    autoCapitalize="characters"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <View style={styles.bottomWrap}>
          <Pressable
            style={[
              styles.startBtn,
              filled ? styles.startBtnEnabled : styles.startBtnDisabled,
            ]}
            onPress={onSubmit}
            disabled={!filled}
          >
            <Text
              style={[
                styles.startBtnTextBase,
                filled ? styles.startBtnTextEnabled : styles.startBtnTextDisabled,
              ]}
            >
              시작하기
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={isDateOpen}
        mode="date"
        onConfirm={onConfirmDate}
        onCancel={() => setIsDateOpen(false)}
        maximumDate={new Date()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3EFE6',
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary150,
    opacity: 0.12,
  },

  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 96,
    paddingBottom: 24,
    alignItems: 'center',
  },

  title: {
    ...typography.head1_28_regular,
    color: '#3B372F',
    letterSpacing: -0.2,
    marginBottom: 22,
    textAlign: 'center',
    lineHeight: 30,
  },

  photoWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 28,
  },

  photoEmpty: {
    width: 233,
    height: 300,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D2C8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  photoHint: {
    ...typography.body2_18_regular,
    color: '#817F7C',
  },

  photoFilled: {
    width: 292,
    height: 292,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8D2C8',
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  photoRemoveBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoRemoveText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: -1,
  },

  formWrap: {
    width: '100%',
    marginTop: 2,
    gap: 22,
  },

  row: {
    width: '100%',
    flexDirection: 'row',
    gap: 26,
  },

  col: { flex: 1 },

  label: {
    ...typography.head3_24_regular,
    color: Colors.primary950,
    marginBottom: 2,
  },

  inputBox: {
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey550,
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },

  input: {
    ...typography.body2_18_regular,
    paddingVertical: 0,
    color: Colors.primary950,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },

  dateBox: {
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey550,
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },

  dateText: {
    ...typography.body2_18_regular,
    color: Colors.primary950,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },

  bottomWrap: {
    paddingHorizontal: 24,
    paddingBottom: 26,
  },

  startBtn: {
    height: 60,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
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

  startBtnTextBase: {
    ...typography.head3_24_regular,
    letterSpacing: -0.24,
    textAlign: 'center',
  },

  startBtnTextDisabled: {
    color: Colors.grey500,
  },

  startBtnTextEnabled: {
    color: Colors.primary50,
  },
});